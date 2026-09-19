import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/lib/pageTitle";
import { markOAuthReturn } from "@/lib/oauthReturn";
import { SITE_NAME, SITE_SHORT } from "@/lib/site";

function GoogleComeIn() {
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
        <p role="alert" className="mt-4 text-[17px] text-cinnamon-deep">
          {error}
        </p>
      ) : null}
      <div className="mt-8">
        <Button
          type="button"
          disabled={pending}
          aria-busy={pending}
          onClick={() => void handleGoogle()}
          className="w-full text-[18px] py-4"
        >
          Continue with Google
        </Button>
      </div>
    </>
  );
}

export function JoinLanding() {
  return (
    <div className="relative z-10 max-w-[36rem] pt-2">
      <PageTitle title={`${SITE_NAME} · The perfect recipe book`} />
      <h1 className="font-display mt-3 text-[2.15rem] leading-[1.12] tracking-tight md:text-[2.6rem]">
        The perfect recipe book
      </h1>
      <p className="mt-4 text-[19px] leading-8 text-ink-soft">
        All your favorite recipes in one place. Your family&apos;s recipes, 
        right where you need them.
      </p>
      <p className="mt-4 text-[19px] leading-8 text-ink-soft">
        Snap a photo. Write later. Done.
      </p>
      <GoogleComeIn />
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
