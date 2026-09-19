const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const fs = require("fs");
const readline = require("readline");
const util = require("util");

const pkg = grpc.loadPackageDefinition(
  protoLoader.loadSync("linearmaps.proto", {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true,
  })
).linearmaps;

const client = new pkg.LinearMaps("localhost:50051", grpc.credentials.createInsecure());
const call = (fn) => util.promisify(fn).bind(client);

function saveRecord(record) {
  fs.appendFileSync("results.jsonl",
    JSON.stringify({ time: new Date().toISOString(), ...record }) + "\n");
  console.log("💾 saved to results.jsonl\n");
}

const parseMatrix = (s) =>
  s.trim().split(";").map((r) => r.trim().split(/\s+/).map(Number));
const parseVec = (s) => s.trim().split(/\s+/).map(Number);
const toProtoMatrix = (rows) => ({ rows: rows.map((values) => ({ values })) });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  console.log("=== Linear Maps (Axler 3A) — client ===");
  while (true) {
    const op = await ask(
      "\n1) Apply T(v)  2) Add S+T  3) Scale λT  4) Compose S∘T  5) Check T(0)=0  q) quit\n> ");

    if (op.trim() === "q") break;

    if (op.trim() === "1") {
      const A = parseMatrix(await ask("matrix T (rows separated by ';'): "));
      const v = parseVec(await ask("vector v: "));
      const resp = await call(client.apply)({ map: toProtoMatrix(A), vector: v });
      console.log("T(v) =", resp.result);
      saveRecord({ op: "apply", A, v, result: resp.result });

    } else if (op.trim() === "2") {
      const A = parseMatrix(await ask("matrix S: "));
      const B = parseMatrix(await ask("matrix T: "));
      const resp = await call(client.add)({ first: toProtoMatrix(A), second: toProtoMatrix(B) });
      console.log("S+T =\n", resp.result.rows.map((r) => r.values));
      saveRecord({ op: "add", A, B, note: resp.note });

    } else if (op.trim() === "3") {
      const A = parseMatrix(await ask("matrix T: "));
      const c = Number(await ask("scalar λ: "));
      const resp = await call(client.scale)({ map: toProtoMatrix(A), scalar: c });
      console.log("λT =\n", resp.result.rows.map((r) => r.values));
      saveRecord({ op: "scale", A, lambda: c, note: resp.note });

    } else if (op.trim() === "4") {
      const S = parseMatrix(await ask("outer map S: "));
      const T = parseMatrix(await ask("inner map T (applied first): "));
      const resp = await call(client.compose)({ outer: toProtoMatrix(S), inner: toProtoMatrix(T) });
      console.log("S∘T =\n", resp.result.rows.map((r) => r.values));
      console.log(resp.note);
      saveRecord({ op: "compose", S, T, note: resp.note });

    } else if (op.trim() === "5") {
      const A = parseMatrix(await ask("matrix T: "));
      const resp = await call(client.sendZero)({ map: toProtoMatrix(A) });
      console.log("T(0) =", resp.tOfZero, "→ holds?", resp.holds, " [Axler 3.10]");
      saveRecord({ op: "zero", A, holds: resp.holds });
    }
  }
  rl.close();
}

main().catch((err) => { console.error(err.message); rl.close(); process.exit(1); });