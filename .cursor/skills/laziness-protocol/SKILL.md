# Laziness Protocol

**Make the simplest change that works.**

## Principle

The best code is the code you don't write. Solve the problem in front of you with the least amount of new complexity. Don't over-engineer for hypothetical future needs.

## Questions to Ask

1. **Can I use what's already here?** — Before adding new code, check if existing code can be reused or extended
2. **Do I need this abstraction?** — Premature abstraction is worse than duplication
3. **Can I remove code instead?** — Deletion is the ultimate simplification
4. **Does this need to be generic?** — Solve the specific problem first; generalize only when you have 3+ use cases

## In Practice

❌ **Don't:**
- Build a "flexible" configuration system for one setting
- Abstract after one use case
- Add libraries for features you can write in 10 lines
- Create interfaces "in case we need to swap implementations later"

✅ **Do:**
- Use a const for one setting; promote to config when you have 5+
- Copy-paste twice before abstracting
- Write a 10-line function instead of adding a dependency
- Use concrete types until you actually need polymorphism

## The Rule of Three

- **First time:** Just do it
- **Second time:** Notice the duplication, but resist abstracting
- **Third time:** Now you understand the pattern — abstract if it simplifies things

## Why It Matters

Every line of code is a liability. Every abstraction is cognitive overhead. Every dependency is a maintenance burden. Lazy developers ship less code that does more.

**YAGNI (You Aren't Gonna Need It).** Solve today's problems today. Tomorrow's problems tomorrow.
