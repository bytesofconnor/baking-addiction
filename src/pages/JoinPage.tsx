import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FamilyDoor, JoinLanding } from "@/components/FamilyDoor";
import { useFamily } from "@/lib/family";
import { isOAuthReturn } from "@/lib/oauthReturn";
import { PageTitle } from "@/lib/pageTitle";
import { SITE_SHORT } from "@/lib/site";

export function JoinPage() {
  const [params] = useSearchParams();
  const inviteToken =
    params.get("invite")?.trim() || params.get("code")?.trim() || "";
  const invite = useQuery(
    api.familyAuth.peekInvite,
    inviteToken ? { inviteToken } : "skip",
  );
  const { status, setKitchenId, signOut } = useFamily();
  const acceptInvite = useMutation(api.familyAuth.acceptInvite);
  const [joinError, setJoinError] = useState(false);

  useEffect(() => {
    if (status !== "in" || !inviteToken || !invite) {
      return;
    }
    let cancelled = false;
    void acceptInvite({ inviteToken })
      .then((kitchenId) => {
        if (!cancelled) {
          setKitchenId(kitchenId);
          window.location.replace("/");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setJoinError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [acceptInvite, invite, inviteToken, setKitchenId, status]);

  if (!inviteToken) {
    if (status === "in") {
      const next = new URLSearchParams(params);
      next.delete("invite");
      next.delete("code");
      const query = next.toString();
      return <Navigate to={query ? `/?${query}` : "/"} replace />;
    }
    if (status === "checking" && isOAuthReturn()) {
      return (
        <>
          <PageTitle title={`Come in · ${SITE_SHORT}`} />
          <p role="status">Opening your book…</p>
        </>
      );
    }
    return <JoinLanding />;
  }

  if (invite === undefined || status === "checking") {
    return (
      <>
        <PageTitle title={`Link · ${SITE_SHORT}`} />
        <p role="status">Opening the link…</p>
      </>
    );
  }

  if (invite === null) {
    return (
      <div className="max-w-[28rem]">
        <PageTitle title={`Link · ${SITE_SHORT}`} />
        <h1 className="font-display mt-3 text-[2.4rem] leading-[1.1] tracking-tight">
          That link ran out
        </h1>
        <p className="mt-4 text-[19px] leading-8 text-ink-soft">
          Ask them to send a new one.
        </p>
      </div>
    );
  }

  if (status === "in") {
    return (
      <>
        <PageTitle title={`Invite · ${SITE_SHORT}`} />
        <p role="status">
          {joinError
            ? "This login couldn’t open that page."
            : `Laying ${invite.kitchenName} into your book…`}
        </p>
        {joinError ? (
          <button
            type="button"
            className="mt-6 min-h-12 cursor-pointer underline decoration-rule underline-offset-4"
            onClick={() => void signOut()}
          >
            Sign out and try a different Google
          </button>
        ) : null}
      </>
    );
  }

  return (
    <FamilyDoor inviteToken={inviteToken} kitchenName={invite.kitchenName} />
  );
}
