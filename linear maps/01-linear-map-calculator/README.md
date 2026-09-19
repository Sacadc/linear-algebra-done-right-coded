# Linear Algebra, Coded

&gt; Rebuilding *Linear Algebra Done Right* — Axler's proof-based, determinant-free
&gt; treatment of linear algebra — as working software, chapter by chapter.

---

## Why this repository exists

Most people *read* linear algebra. I decided to **refuse to believe any theorem I
could not make a computer verify**.

This repository is my journey through Sheldon Axler's *Linear Algebra Done Right*
(4th edition) — one of the most rigorous undergraduate math textbooks in the world,
where every concept is built from proofs rather than computation tricks. Each
section of the book becomes a fully working software project: every definition is
a data structure, every theorem is a test, every proof is an algorithm.

If a linear map can't be composed, a null space can't be computed, or the
rank–nullity theorem doesn't hold numerically — I don't understand it yet,
and the code won't let me pretend I do.

## The stack (and why)

| Layer | Technology | Reason |
|-------|-----------|--------|
| Math engine | **Python + NumPy** | The language of scientific computing; closest to the mathematics |
| API / client | **Node.js** | Strong typing culture, rapid iteration, industry-standard tooling |
| Communication | **gRPC + Protocol Buffers** | Language-agnostic, schema-first contracts — the same discipline as mathematical definitions |
| Persistence | JSONL → SQLite | Every computation is recorded, versioned, and inspectable |

The Python/Node split is deliberate: it proves the mathematics is portable
across languages and paradigms, not tied to one ecosystem.

## Projects

| # | Project | Axler Section | Key ideas |
|---|---------|---------------|-----------|
| 01 | Linear Map Calculator | 3A | Linear maps as matrices, composition, non-commutativity (`ST ≠ TS`), `T(0)=0` |
| 02 | *coming soon* | 3B | Null spaces, ranges, rank–nullity theorem |
| 03 | *coming soon* | 3C | Matrix representation, column–row factorization |
| 04 | *coming soon* | 3D | Invertibility, isomorphisms, change of basis |

## How a definition becomes code

Example — Axler 3.4 (**Linear Map Lemma**): *a linear map is uniquely determined
by its values on a basis.* In this repo that isn't a sentence to memorize; it's a
constructor: give the program basis vectors and their images, and it builds the
unique map, verifies additivity and homogeneity on random inputs, and stores the
result. The proof and the program say the same thing in two languages.

## What this repository demonstrates

- **Mathematical maturity** — engaging with proof-based material, not just formulas
- **Full-stack engineering** — service architecture, interface contracts (proto files), client design
- **Persistence & reproducibility** — every result logged, every experiment repeatable
- **Self-directed learning** — building publicly, committing regularly, with a visible roadmap

## Roadmap

- [x] Chapter 3A — Vector Space of Linear Maps
- [ ] Chapter 3B — Null Spaces and Ranges
- [ ] Chapter 3C — Matrices
- [ ] Chapter 3D — Invertibility and Isomorphisms
- [ ] Chapter 3E–3F — Products, Quotients, Duality
- [ ] Chapters 5+ — Eigenvalues, invariant subspaces, inner products

## About

Built by sacad as a self-directed bridge between pure mathematics and
software engineering.

*License: MIT. Textbook concepts referenced from Axler, LADR 4th ed.; all code is original.*