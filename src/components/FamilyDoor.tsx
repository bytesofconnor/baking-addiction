import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { PageTitle } from "@/lib/pageTitle";
import { markOAuthReturn } from "@/lib/oauthReturn";
import { SITE_NAME, SITE_SHORT } from "@/lib/site";

function GoogleComeIn({ cover = false }: { cover?: boolean }) {
  const { signIn } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleGoogle() {
    setError(null);
    setPending(true);
    try {
      markOAuthReturn();
      await signIn("google", { redirectTo: window.location.href });
    } catch {
      setError("Google didn't open. Try once more.");
      setPending(false);
    }
  }

  return (
    <>
      {error ? (
        <p
          role="alert"
          className={cover ? "book-cover-error" : "mt-4 text-[17px] text-cinnamon-deep"}
        >
          {error}
        </p>
      ) : null}
      <div className={cover ? "book-cover-cta-wrap" : "mt-8"}>
        <button
          type="button"
          className={
            cover
              ? "book-cover-cta"
              : "book-press book-press-text book-press-save w-full"
          }
          disabled={pending}
          aria-busy={pending}
          onClick={() => void handleGoogle()}
        >
          Continue with Google
        </button>
      </div>
    </>
  );
}

export function JoinCoverLanding({ invited = false }: { invited?: boolean }) {
  return (
    <div className="book-cover-copy">
      <PageTitle title={SITE_NAME} />
      <p className="book-cover-eyebrow">
        {invited ? "You’ve been invited" : "For the whole family"}
      </p>
      <h1 className="book-cover-headline">
        {invited ? "Come cook with us." : "Recipes worth keeping."}
      </h1>
      <p className="book-cover-promise">
        {invited
          ? "Sign in to share recipes with your family."
          : "Keep family favorites, photos, and the little changes that make them yours."}
      </p>
      <p className="book-cover-proof">
        A photo is enough to start.
      </p>
      <GoogleComeIn cover />
    </div>
  );
}

export function FamilyDoor({
  kitchenName,
}: {
  inviteToken?: string;
  kitchenName?: string;
}) {
  const heading = kitchenName ? `${kitchenName}'s recipes` : "Come in";
  const blurb = kitchenName
    ? "Their recipes come into your book. Use the Google you already have."
    : "Use the Google you already have. Same one as Gmail.";

  return (
    <div className="relative z-10 mt-8 max-w-[28rem] pt-2 md:mt-4">
      <PageTitle title={`${heading} · ${SITE_SHORT}`} />
      {kitchenName ? (
        <h1 className="font-display text-[2.4rem] leading-[1.1] tracking-tight">
          {heading}
        </h1>
      ) : null}
      <p
        className={`${kitchenName ? "mt-4" : ""} text-[19px] leading-8 text-ink-soft`}
      >
        {blurb}
      </p>
      <GoogleComeIn />
    </div>
  );
}
