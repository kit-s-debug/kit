/** The enquiry schema is the data-protection boundary, so its acceptances and
 *  rejections get a test. */
import { enquirySchema } from "../lib/enquiry";

const cases: [string, unknown, boolean][] = [
  ["safe-contact phone", {format:"home-visit",name:"Sam",method:"phone",phone:"07123 456789",discreet:"text first, no voicemail",safeTimes:"weekday mornings",concession:true,website:""}, true],
  ["email path", {format:"online",name:"Al",method:"email",email:"al@example.com",concession:false,website:""}, true],
  ["phone missing", {format:"phone",name:"Bo",method:"phone",phone:"",concession:false,website:""}, false],
  ["bad email", {format:"online",name:"Cy",method:"email",email:"nope",concession:false,website:""}, false],
  ["honeypot filled", {format:"in-person",name:"D",method:"phone",phone:"07123456789",website:"x"}, false],
  ["no name", {format:"in-person",name:"",method:"phone",phone:"07123456789",website:""}, false],
];

let failed = 0;
for (const [label, input, expectOk] of cases) {
  const r = enquirySchema.safeParse(input);
  const ok = r.success === expectOk;
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✗"} ${label.padEnd(22)} expected ${expectOk ? "accept" : "reject"}, got ${r.success ? "accept" : "reject"}`);
}
console.log(failed ? `\n${failed} failing` : "\nall enquiry cases pass");
if (failed) process.exit(1);
