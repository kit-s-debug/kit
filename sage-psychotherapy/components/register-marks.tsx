import Image from "next/image";

/**
 * The BACP and PSA marks, under the qualifications they belong to.
 *
 * Hidden from assistive technology on purpose: both facts are already stated
 * in the register immediately above ("Registered member, BACP" and
 * "Professional Standards Authority — Accredited Register"), so announcing the
 * logos as well would only repeat them.
 *
 * The white ground each logo was supplied on has been knocked out to alpha, so
 * they sit on a paper plate that stays paper in the evening palette too — the
 * marks must not be recoloured, and this way nothing else has to be.
 */
export function RegisterMarks({ className = "" }: { className?: string }) {
  return (
    <div className={`register-marks ${className}`} aria-hidden="true">
      <span className="register-mark">
        <Image src="/images/bacp.png" alt="" width={197} height={96} className="register-bacp" />
      </span>
      <span className="register-mark">
        <Image src="/images/psa.png" alt="" width={196} height={96} className="register-psa" />
      </span>
    </div>
  );
}
