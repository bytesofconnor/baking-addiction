type Change = { move: string; change: string; why: string };

function bakerOf(name: string): string {
  const who = name.trim();
  return who.length > 0 ? who : "this kitchen";
}

function bakerPossessive(name: string): string {
  const who = bakerOf(name);
  if (who === "this kitchen") {
    return "this kitchen's";
  }
  return /s$/i.test(who) ? `${who}'` : `${who}'s`;
}

export function letterFromNotes({
  title,
  question,
  changes,
  bakerName,
}: {
  title: string;
  question: string;
  changes: Change[];
  bakerName: string;
}): string {
  const baker = bakerOf(bakerName);
  const theirs = bakerPossessive(bakerName);
  const asked = question.trim();
  const sauce = changes
    .filter((change) => change.move.trim().length > 0)
    .map((change) => `${change.move}: ${change.change}. ${change.why}`)
    .join(" ");

  if (asked.length === 0) {
    const first = changes[0];
    if (!first) {
      return `Stay with the written method for ${title}, then only keep the notes you can still do. That's how this book is supposed to work.`;
    }
    return `If you're remixing ${title}, start with ${theirs} keeper: ${first.move.toLowerCase()} — ${first.change}. ${first.why}\n\nAsk with the ingredient you're missing and we'll stay on this tray, not send you to a different recipe.`;
  }

  const hay = `${asked} ${sauce}`.toLowerCase();

  if (/\b(spice|cinnamon|nutmeg|ginger|pumpkin pie)\b/.test(hay)) {
    return `No pumpkin pie spice is fine. Stir 2 parts cinnamon, 1 part ginger, and a pinch of nutmeg. ${baker} dialed up the warmth on this bake, so start there and taste the batter before it goes in.\n\nIf cinnamon is all you have, use it, plus the tiniest grind of black pepper. It reads as bakery spice, not chili.`;
  }
  if (/\b(chocolate|chip)\b/.test(hay)) {
    return `Skip the chocolate if the bag is empty. ${baker} added chips because the kids asked — the bake still stands without them.\n\nA chopped dark bar works in a pinch. Fold it in late so it doesn't sink.`;
  }
  if (/\b(butter|brown)\b/.test(hay)) {
    return `If you can't brown the butter, melt it. You'll lose the toffee note; a splash of vanilla helps.\n\nWhen you do brown it, pull the pan when it smells like toasted nuts and the foam quiets. That's the whole banana-bread note.`;
  }
  if (/\b(sugar|sweet|honey|maple)\b/.test(hay)) {
    return `${baker} already cuts sugar when the fruit is sweet. You can take another spoonful out of a filling, but leave the crumb or frosting alone or it goes flat.\n\nHoney or maple can stand in for about three-quarters of the white sugar — they brown faster, so watch the oven.`;
  }
  if (/\b(walnut|nut|pecan|almond)\b/.test(hay)) {
    return `Leave the nuts out. ${baker} already skips walnuts so everyone at the table can eat. The loaf doesn't need them.`;
  }
  if (/\b(frosting|icing)\b/.test(hay)) {
    return `Skip the icing. ${baker} often does — too sweet for breakfast, and cupcakes travel better with a smaller swirl.\n\nA dusting of powdered sugar, or nothing. The crumb is the point.`;
  }
  if (/\b(onion|shallot|leek|scallion|green onion)\b/.test(hay)) {
    return `Leave the onions out, or swap in a little celery, a grated carrot, or a pinch of onion powder if you have it. Stay on ${theirs} ${title} — don't chase a different recipe.\n\nTaste before it goes in the oven; without onion you'll want a bit more salt or garlic.`;
  }
  if (/\b(salt|salty)\b/.test(hay)) {
    return `No salt is fine for a minute — taste the filling before it goes in. A splash of soy sauce, a pinch of Parmesan, or even a squeeze of lemon can stand in for the savoriness salt would give ${title}.\n\nAdd a little at a time; you can always put more on at the table. Stay on ${theirs} tray.`;
  }
  if (/\b(bell )?peppers?\b/.test(hay) || /\bno peppers?\b/.test(hay)) {
    return `If you're out of peppers for ${title}, bake the filling in a shallow dish or hollowed zucchini / tomato cups — same seasoning, different shell.\n\nIt won't be stuffed peppers, but it'll still be ${theirs} filling. Don't chase a different recipe; just change the vessel.`;
  }
  if (/\b(garlic)\b/.test(hay)) {
    return `Skip the fresh garlic. A pinch of garlic powder, or a little extra onion / shallot if you have it, keeps ${title} from tasting flat.\n\nStay on ${theirs} tray — don't rewrite the whole bake.`;
  }

  const missing = asked.replace(/^["'\s]+|["'\s.]+$/g, "");
  const map = changes.map((change) => change.move).filter(Boolean).join(", ");
  return `For ${title}: if you're short on “${missing},” leave it out or swap the closest thing you have on the counter — then taste before it goes in. Stay on ${theirs} tray; don't chase a different recipe.\n\n${map ? `Lean on what ${baker} already wrote: ${map}.` : "Use the notes beside the story if there are any."}`;
}
