"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Crisis } from "@/components/crisis";
import { booking, practice } from "@/content/site";

export function ThanksBody() {
  const state = useSearchParams().get("state");

  if (state === "error" || state === "busy") {
    return (
      <div className="shell page-head">
        <h1 className="page-heading">{booking.errorHeading}</h1>
        <p className="page-lede">{booking.errorBody}</p>
        <p>
          <a href={practice.phoneHref} className="action">
            Ring {practice.phone}
          </a>
        </p>
        <p>
          <Link href="/#book" className="action-quiet">
            Try the form again
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="shell page-head">
      <p lang="cy" className="booking-diolch booking-diolch-page">
        {booking.confirmation.welsh}.
      </p>
      <h1 className="page-heading">{booking.confirmation.heading}</h1>
      {booking.confirmation.lines.map((line) => (
        <p key={line} className="page-lede">
          {line}
        </p>
      ))}
      <p className="page-lede">
        {booking.confirmation.ring}{" "}
        <a href={practice.phoneHref} className="link-plain">
          {practice.phone}
        </a>
      </p>
      <Crisis className="thanks-crisis" />
      <Link href="/" className="action-quiet">
        Back to the main page
      </Link>
    </div>
  );
}
