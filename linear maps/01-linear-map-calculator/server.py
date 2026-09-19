import grpc
from concurrent import futures
import numpy as np

import linearmaps_pb2
import linearmaps_pb2_grpc


def to_numpy(m):
    rows = [list(r.values) for r in m.rows]
    if not rows or any(len(r) != len(rows[0]) for r in rows):
        raise ValueError("matrix must be non-empty and rectangular")
    return np.array(rows, dtype=float)


def to_msg(arr):
    m = linearmaps_pb2.Matrix()
    for row in np.atleast_2d(arr):
        m.rows.add(values=[float(x) for x in row])
    return m


class LinearMapsServicer(linearmaps_pb2_grpc.LinearMapsServicer):
    def Apply(self, request, context):
        A, x = to_numpy(request.map), np.array(request.vector)
        if A.shape[1] != x.shape[0]:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT,
                          f"need {A.shape[1]} entries in vector, got {x.shape[0]}")
        return linearmaps_pb2.ApplyResponse(result=(A @ x).tolist())

    def Add(self, request, context):
        A, B = to_numpy(request.first), to_numpy(request.second)
        if A.shape != B.shape:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "shapes must match")
        return linearmaps_pb2.MapResponse(
            result=to_msg(A + B), note="(S+T)(v) = Sv + Tv   [Axler 3.5]")

    def Scale(self, request, context):
        A = to_numpy(request.map)
        return linearmaps_pb2.MapResponse(
            result=to_msg(request.scalar * A), note="(λT)(v) = λ(Tv)   [Axler 3.5]")

    def Compose(self, request, context):
        S, T = to_numpy(request.outer), to_numpy(request.inner)
        if S.shape[1] != T.shape[0]:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT,
                          f"cannot compose: outer is {S.shape}, inner is {T.shape}")
        return linearmaps_pb2.MapResponse(
            result=to_msg(S @ T),
            note="(ST)(u) = S(Tu) — do the INNER map first!   [Axler 3.7]")

    def SendZero(self, request, context):
        A = to_numpy(request.map)
        y = A @ np.zeros(A.shape[1])
        return linearmaps_pb2.ZeroResponse(holds=bool(np.allclose(y, 0)),
                                           t_of_zero=y.tolist())


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    linearmaps_pb2_grpc.add_LinearMapsServicer_to_server(LinearMapsServicer(), server)
    server.add_insecure_port("[::]:50051")
    server.start()
    print("Linear map server listening on port 50051")
    server.wait_for_termination()


if __name__ == "__main__":
    serve()