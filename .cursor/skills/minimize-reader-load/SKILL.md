# Minimize Reader Load

**Write code others can understand quickly.**

## Principle

Code is read more often than it's written. Every line adds cognitive load. Make it easy for the next person (including future you) to understand what's happening and why.

## Guidelines

### Names Should Explain Themselves

❌ **Don't:**
```typescript
const x = data.filter(d => d.s === "sally");
```

✅ **Do:**
```typescript
const sallyRecipes = recipes.filter(r => r.source === "sally");
```

### Functions Should Do One Thing

❌ **Don't:**
```typescript
function handleSubmit() {
  validate();
  transform();
  upload();
  redirect();
  track();
}
```

✅ **Do:**
```typescript
function handleSubmit() {
  const recipe = prepareRecipe(formData);
  await saveRecipe(recipe);
  showSuccessAndRedirect();
}
```

### Comments Should Explain Why, Not What

❌ **Don't:**
```typescript
// Set loading to true
setLoading(true);
```

✅ **Do:**
```typescript
// Prevent double-submit while request is in-flight
setLoading(true);
```

### Avoid Deep Nesting

❌ **Don't:**
```typescript
if (user) {
  if (user.isFamily) {
    if (recipe.isPrivate) {
      if (user.kitchens.includes(recipe.kitchenId)) {
        return <Recipe />;
      }
    }
  }
}
```

✅ **Do:**
```typescript
if (!user?.isFamily) return <JoinPrompt />;
if (!recipe.isPrivate) return <Recipe />;
if (!user.kitchens.includes(recipe.kitchenId)) return <PermissionDenied />;
return <Recipe />;
```

## Why It Matters

Readable code is maintainable code. When the next developer (or AI agent) can understand your code in 10 seconds instead of 10 minutes, they can fix bugs faster, add features safely, and avoid breaking things.

**Write for humans, not machines.**
