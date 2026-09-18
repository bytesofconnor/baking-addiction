type Change = { move: string; change: string; why: string };

export function letterFromNotes({
  title,
  question,
  changes,
}: {
  title: string;
  question: string;
  changes: Change[];
}): string {
  const asked = question.trim();
  const sauce = changes
    .filter((change) => change.move.trim().length > 0)
    .map((change) => `${change.move}: ${change.change}. ${change.why}`)
    .join(" ");

  if (asked.length === 0) {
    const first = changes[0];
    if (!first) {
      return `Stay with Sally for ${title}, then only keep the notes you can still do. That's how this book is supposed to work.`;
    }
    return `If you're remixing ${title}, start with Mom's keeper: ${first.move.toLowerCase()} — ${first.change}. ${first.why}\n\nAsk with the ingredient you're missing and we'll stay on this tray, not send you to a different recipe.`;
  }

  const hay = `${asked} ${sauce}`.toLowerCase();

  if (/\b(spice|cinnamon|nutmeg|ginger|pumpkin pie)\b/.test(hay)) {
    return `No pumpkin pie spice is fine. Stir 2 parts cinnamon, 1 part ginger, and a pinch of nutmeg. Mom doubled the warmth on this bake, so start there and taste the batter before it goes in.\n\nIf cinnamon is all you have, use it, plus the tiniest grind of black pepper. It reads as bakery spice, not chili.`;
  }
  if (/\b(chocolate|chip)\b/.test(hay)) {
    return `Skip the chocolate if the bag is empty. Mom added chips because the kids asked — the bake still stands without them.\n\nA chopped dark bar works in a pinch. Fold it in late so it doesn't sink.`;
  }
  if (/\b(butter|brown)\b/.test(hay)) {
    return `If you can't brown the butter, melt it. You'll lose the toffee note; a splash of vanilla helps.\n\nWhen you do brown it, pull the pan when it smells like toasted nuts and the foam quiets. That's the whole banana-bread note.`;
  }
  if (/\b(sugar|sweet|honey|maple)\b/.test(hay)) {
    return `Mom already cuts sugar when the fruit is sweet. You can take another spoonful out of a filling, but leave the crumb or frosting alone or it goes flat.\n\nHoney or maple can stand in for about three-quarters of the white sugar — they brown faster, so watch the oven.`;
  }
  if (/\b(walnut|nut|pecan|almond)\b/.test(hay)) {
    return `Leave the nuts out. Mom already skips walnuts so everyone at the table can eat. The loaf doesn't need them.`;
  }
  if (/\b(frosting|icing)\b/.test(hay)) {
    return `Skip the icing. Mom often does — too sweet for breakfast, and cupcakes travel better with a smaller swirl.\n\nA dusting of powdered sugar, or nothing. The crumb is the point.`;
  }

  const map = changes.map((change) => change.move).filter(Boolean).join(", ");
  return `Stay close to Mom's tray for ${title}. Her map is ${map || "the notes beside the story"}. Name the one thing you're out of and ask again — we'll swap that, not rewrite Sally.`;
}
