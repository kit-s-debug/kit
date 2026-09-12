/**
 * The matcher is the memorable thing about this site, so it gets a test.
 * Each case lists what a real person might type and the areas that must appear.
 */
import { areas } from "../content/site";
import { findAreas } from "../lib/match";

const cases: [input: string, expected: string[]][] = [
  // the four the brief names
  ["I can't sleep", ["Anxiety"]],
  ["I keep snapping at my kids", ["Anger management", "Family issues"]],
  ["I don't know who I am anymore", ["Low self-esteem"]],
  ["I drink more than I should", ["Alcoholism"]],
  // the rest of the rotating examples
  ["I'm on edge all the time", ["Anxiety"]],
  ["I can't stop checking things", ["Perfectionism"]],
  // ordinary phrasing
  ["my heart races and I think I'm dying", ["Panic attacks"]],
  ["walking on eggshells at home", ["Emotional abuse"]],
  ["my husband checks my phone and won't let me see friends", ["Domestic abuse"]],
  ["lost my mum in March", ["Bereavement"]],
  ["we argue about the same thing every week", ["Relationship problems"]],
  ["I found messages on his phone", ["Affairs and betrayals"]],
  ["waiting for an ADHD assessment", ["ADHD"]],
  ["I mask all day and come home wrecked", ["Autism"]],
  ["gambling has got out of hand", ["Gambling"]],
  ["burnt out at work and dreading Mondays", ["Burnout"]],
  ["nothing feels good any more", ["Depression"]],
  ["I hate myself", ["Low self-esteem"]],
  ["flashbacks and nightmares", ["Trauma"]],
  ["we're getting divorced", ["Separation and divorce"]],
  ["I want to die", ["Suicidal thoughts"]],
  // typos should still land
  ["anxios all the time", ["Anxiety"]],
  ["panick attacks", ["Panic attacks"]],
];

let failed = 0;
for (const [input, expected] of cases) {
  const { matches, urgent } = findAreas(input, areas);
  const names = matches.map((m) => m.name);
  const ok = expected.every((e) => names.includes(e));
  if (!ok) failed++;
  console.log(
    `${ok ? "✓" : "✗"} ${input.padEnd(46)} → ${names.join(", ") || "(nothing)"}${urgent ? "  [urgent]" : ""}`,
  );
  if (!ok) console.log(`    wanted: ${expected.join(", ")}`);
}

// Gibberish and empties must produce nothing rather than a wrong guess.
for (const noise of ["", "  ", "asdfgh", "zzz"]) {
  const { matches } = findAreas(noise, areas);
  const ok = matches.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✗"} no false match on ${JSON.stringify(noise)}`);
}

console.log(failed ? `\n${failed} failing` : "\nall matcher cases pass");
if (failed) process.exit(1);
