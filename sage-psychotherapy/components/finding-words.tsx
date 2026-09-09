"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { areas, chapters, clusters, crisis, cta, finder } from "@/content/site";
import { findAreas } from "@/lib/match";
import { Chapter } from "./chapter";
import { Sprig, Wreath } from "./sprig";

/**
 * Finding the words.
 *
 * Instead of a wall of 37 clinical terms, a box you describe yourself into.
 * Everything happens in this browser: no request, no storage, no telemetry.
 * That promise is why the whole thing is a plain function call.
 *
 * Without JavaScript the input is a real form that jumps to the grouped list
 * below, and every clinical term is in the DOM from the first paint whether the
 * bands are open or not — so search engines and screen readers see the lot.
 *
 * If what someone types is about self-harm or suicide, the help lines come
 * first and the booking prompt waits its turn.
 */
export function FindingWords() {
  const inputId = useId();
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [rotate, setRotate] = useState(false);
  const results = useRef<HTMLDivElement>(null);

  const grouped = useMemo(
    () =>
      clusters.map((cluster) => ({
        ...cluster,
        areas: areas.filter((area) => area.cluster === cluster.id),
      })),
    [],
  );

  const result = useMemo(
    () => (submitted.trim() ? findAreas(submitted, areas) : null),
    [submitted],
  );

  // Rotate the example phrases so it is obvious what the box is for — but only
  // where movement is welcome.
  useEffect(() => {
    const allowed = () =>
      document.documentElement.getAttribute("data-calm") !== "on" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const settle = () => setRotate(allowed());
    settle();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", settle);
    const watcher = new MutationObserver(settle);
    watcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-calm"],
    });
    return () => {
      motion.removeEventListener("change", settle);
      watcher.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!rotate || value) return;
    const timer = window.setInterval(
      () => setExampleIndex((i) => (i + 1) % finder.examples.length),
      3600,
    );
    return () => window.clearInterval(timer);
  }, [rotate, value]);

  const cluster = result?.cluster
    ? clusters.find((c) => c.id === result.cluster)
    : null;

  return (
    <section id="words" className="room finder" aria-labelledby="finder-heading">
      <Wreath size={460} className="greenery finder-greenery" />
      <Sprig variant="arc" size={96} className="sprig-set finder-sprig" />
      <div className="shell-editorial finder-shell">
        <Chapter {...chapters.words} />
        <h2 id="finder-heading" className="finder-heading">
          {finder.heading}
        </h2>

        <form
          className="finder-form"
          action="#words-list"
          method="get"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(value);
            // Move focus to the answer so a keyboard or screen reader user
            // lands on it rather than hunting for what changed.
            window.requestAnimationFrame(() => results.current?.focus());
          }}
        >
          <label htmlFor={inputId} className="visually-hidden">
            {finder.label}
          </label>
          <input
            id={inputId}
            name="q"
            type="text"
            className="field finder-input"
            autoComplete="off"
            enterKeyHint="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={finder.examples[exampleIndex]}
          />
          <button type="submit" className="action finder-submit">
            {finder.submit}
          </button>
        </form>

        <p className="finder-help">{finder.help}</p>

        <noscript>
          <p className="finder-help finder-noscript">{finder.noscript}</p>
        </noscript>

        <div
          className="finder-results"
          ref={results}
          tabIndex={-1}
          aria-live="polite"
          data-state={result ? (result.matches.length ? "found" : "empty") : "idle"}
        >
          {result && result.matches.length > 0 && (
            <>
              <hr className="sill finder-sill" />
              {result.urgent && (
                <div className="finder-urgent">
                  <p className="finder-urgent-lead">{crisis.body}</p>
                  <ul className="finder-urgent-list">
                    {crisis.lines.slice(0, 2).map((line) => (
                      <li key={line.name}>
                        <a href={line.href} className="link-plain">
                          {line.name}
                        </a>{" "}
                        <span className="finder-urgent-detail">{line.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="label finder-result-label">{finder.resultHeading}</p>
              <ul className="finder-matches">
                {result.matches.map((match) => (
                  <li key={match.name}>{match.name}</li>
                ))}
              </ul>
              {cluster && <p className="finder-warm">{cluster.line}</p>}
              <p className="finder-works">{finder.worksWith}</p>
              <a href="#book" className="action finder-action">
                {cta.primary}
              </a>
            </>
          )}

          {result && result.matches.length === 0 && (
            <>
              <hr className="sill finder-sill" />
              <p className="finder-warm">{finder.noMatch.heading}</p>
              <p className="finder-works">{finder.noMatch.body}</p>
              <a href="#book" className="action finder-action">
                {cta.primary}
              </a>
            </>
          )}
        </div>
      </div>

      <div className="shell-editorial finder-list" id="words-list">
        <div className="finder-list-head">
          <Sprig variant="three" size={18} className="finder-leaf" />
          <h3 className="finder-list-heading">{finder.listHeading}</h3>
        </div>
        <p className="finder-help finder-list-help">{finder.listHelp}</p>

        <div className="bands">
          {grouped.map((group) => (
            <details key={group.id} className="band">
              <summary>
                <span className="band-name">{group.name}</span>
                <span className="band-count">{group.areas.length}</span>
              </summary>
              <ul className="band-items">
                {group.areas.map((area) => (
                  <li key={area.name}>{area.name}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
