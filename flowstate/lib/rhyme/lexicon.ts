/**
 * FLOWSTATE's rhyme lexicon.
 *
 * Words are grouped into families that share a rhyme key (the phoneme run from
 * the last stressed vowel to the end of the word). Grouping rather than storing
 * a key per word keeps the data compact and means every entry in a family is a
 * guaranteed perfect rhyme for every other — no dictionary lookups, no network.
 *
 * Annotations: `:v` verb, `:p` past-tense verb, `:a` adjective, `:l` plural noun,
 * `:r` adverb/particle. Bare words are treated as singular nouns. The part of speech decides which line templates a rhyme can
 * be dropped into, so that ideas read as English rather than as slot-filling.
 */

import type { TopicId } from '@/types';
import { countSyllables, normaliseWord } from './g2p';

export type PartOfSpeech = 'n' | 'v' | 'a' | 'r' | 'p' | 'l';

export interface LexEntry {
  word: string;
  key: string;
  pos: PartOfSpeech;
  syllables: number;
  topics: TopicId[];
  /** Rough commonness rank; lower is more common. Used to avoid odd picks. */
  rank: number;
}

const FAMILIES = `
AY|my:r why:r high:a sky fly:v try:v cry:v dry:a buy:v lie:v tie:v guy eye die:v spy shy:a supply:v reply:v apply:v deny:v rely:v goodbye
AY-T|light night right:a fight:v sight tight:a might bright:a flight height write:v white:a quite:r invite:v ignite:v unite:v delight tonight:r alright:a spotlight insight
AY-M|time crime climb:v prime:a rhyme dime lifetime sometime:r overtime
AY-N|line mine shine:v sign design define:v divine:a nine fine:a spine decline:v align:v
AY-N-D|mind find:v grind:v kind:a blind:a behind:r remind:v signed:p designed:p unwind:v mankind
AY-D|side ride:v pride wide:a hide:v slide:v guide tried:p decide:v provide:v inside:r outside:r divide:v collide:v
AY-F|life knife wife strife
AY-V|drive:v alive:a survive:v arrive:v five dive:v thrive:v
AY-ER|fire hire:v wire liar higher:a buyer desire entire:a inspire:v retire:v empire admire:v
AY-Z|rise:v size prize eyes:l lies:l wise:a surprise realise:v despise:v disguise
AY-L|mile style smile while:r file trial denial worthwhile:a
AY-P|type hype pipe stripe ripe:a
AY-K|like:v mic strike:v spike bike
EY|day way say:v play:v stay:v pay:v may grey:a they:r away:r today:r okay:a display delay betray:v replay everyday:a
EY-K|make:v take:v break:v fake:a shake:v stake wake:v snake cake lake ache brake flake quake steak mistake awake:a
EY-M|name game fame flame same:a blame:v frame claim:v aim:v shame became:p proclaim:v
EY-N|pain rain chain brain train gain:v plain:a plane lane main:a vein remain:v explain:v maintain:v champagne insane:a domain campaign terrain
EY-T|late:a wait:v great:a state weight straight:a create:v hate:v gate plate rate fate debate relate:v elevate:v motivate:v celebrate:v dedicate:v concentrate:v
EY-S|face place space race chase:v pace grace base case trace:v embrace:v replace:v erase:v
EY-D|made:p paid:p fade:v grade shade trade blade afraid:a parade upgrade persuade:v
EY-V|save:v brave:a wave gave:p grave behave:v crave:v pave:v
EY-P|shape escape:v tape grape cape
EY-NG-JH|change:v range strange:a exchange arrange:v
EY-B-AH-L|able:a table stable:a label cable unstable:a
EY-SH-AH-N|nation station vacation creation foundation dedication motivation education situation generation celebration conversation reputation elevation frustration information determination
EY-K-IH-NG|making taking breaking shaking waking faking staking
EY-S-IH-NG|chasing racing facing pacing replacing embracing
AY-M-IH-NG|timing climbing rhyming priming
AY-T-ER|writer fighter lighter:a brighter:a tighter:a
AY-N-ER|finer:a minor:a designer diner
IY|free:a be:p see:v three key me:r tree degree agree:v guarantee sea
IY-T|beat street heat meat seat sweet:a feet repeat:v complete:a defeat:v retreat:v concrete:a elite:a compete:v
IY-M|dream team scheme stream seem:v extreme:a redeem:v esteem regime
IY-N|scene mean:v clean:a green:a screen machine routine between:r unseen:a teen
IY-L|real:a feel:v deal steal:v wheel heal:v reveal:v appeal ideal:a conceal:v
IY-D|need:v speed lead:v seed greed feed:v bleed:v succeed:v proceed:v indeed:r agreed:p
IY-S|peace piece release:v increase police crease decrease
IY-P|deep:a keep:v sleep:v cheap:a steep:a leap:v
IY-CH|reach:v teach:v speech beach each:a
IY-V|leave:v believe:v achieve:v receive:v relieve:v grieve:v sleeve
IY-Z|please:v ease breeze squeeze:v freeze:v keys:l degrees:l disease
IY-Z-AH-N|reason season treason
IY-P-ER|deeper:a keeper sleeper cheaper:a
IH-T|hit:v quit:v split:v spit:v grit commit:v admit:v legit:a permit:v
IH-N|win:v spin:v begin:v skin within:r discipline
IH-NG|king thing ring sing:v bring:v swing:v wing string everything anything
IH-K|sick:a quick:a thick:a trick stick:v brick click:v pick:v slick:a
IH-P|grip trip flip:v slip:v ship lip tip equip:v
IH-L|still:r skill will fill:v kill:v chill:v bill thrill until:r fulfil:v
IH-S|this miss:v kiss bliss
IH-F-T|shift gift lift:v drift:v swift:a
IH-N-ER|winner dinner beginner thinner:a
IH-N-IH-NG|winning spinning beginning thinning
IH-SH-AH-N|mission ambition condition tradition position permission admission tuition intuition competition recognition
IH-K-SH-AH-N|fiction friction addiction prediction contradiction conviction
IH-T-IY|city pity pretty:a committee
IH-T-ER|bitter:a quitter glitter litter transmitter
IH-S-T-ER|mister sister resistor blister
IH-NG-K|think:v drink:v link sink:v blink:v brink ink rethink:v
IH-V-IH-NG|living giving forgiving
IH-K-IY|tricky:a sticky:a picky:a
EH-T|get:v set:v bet:v let:v sweat threat regret forget:v upset:a jet debt
EH-D|head dead:a said:p bread spread:v instead:r ahead:r thread led:p
EH-N|when:r again:r ten pen men:l then:r
EH-S|stress less:a press:v dress address progress success express:v confess:v impress:v obsess:v
EH-K-T|respect effect connect:v protect:v perfect:a direct:a correct:a reflect:v project neglect:v collect:v expect:v
EH-L|tell:v sell:v bell spell:v yell:v farewell hotel propel:v
EH-N-D|end friend spend:v send:v bend:v defend:v pretend:v depend:v recommend:v attend:v blend:v trend
EH-V-ER|never:r ever:r forever:r whatever:r clever:a
EH-T-ER|better:a letter sweater setter
EH-ZH-ER|measure pleasure treasure leisure
EH-SH-ER|pressure
EH-N-SH-AH-N|mention tension attention intention dimension prevention invention
EH-N-T-AH-L|mental:a rental fundamental:a instrumental:a monumental:a accidental:a
EH-N-T-IY|plenty twenty empty:a
EH-N-IY|many:a any:a penny
EH-L-F|self shelf itself myself yourself herself himself
EH-T-IH-NG|getting setting betting forgetting regretting
EH-D-IY|ready:a steady:a already:r
AE-K|back track black:a attack:v crack:v pack:v stack rack lack:v snack unpack:v
AE-T|that flat:a cat chat:v stat combat format
AE-N|man plan can:p ran:p began:p span fan
AE-N-D|hand stand:v land grand:a brand command understand:v demand expand:v planned:p
AE-S-T|past last:a fast:a blast cast:v vast:a contrast outlast:v
AE-SH|cash flash crash:v smash:v clash:v dash stash
AE-P|trap map gap snap:v wrap:v clap:v rap strap
AE-M|jam slam:v program diagram
AE-CH|catch:v match patch scratch:v
AE-K-T|fact act:v impact contract exact:a attract:v react:v intact:a abstract:a
AE-N-S|chance dance:v advance romance circumstance finance
AE-D|bad:a mad:a sad:a glad:a had:p
AE-N-JH-ER|danger stranger arranger
AE-SH-AH-N|passion fashion compassion
AE-T-ER|matter latter:a shatter:v chatter:v scatter:v flatter:v
AE-L-AH-T-IY|reality mentality brutality personality originality
AE-N-T|plant grant slant:v chant transplant
AE-M-P|champ camp stamp lamp
AE-N-K|thank:v bank tank rank blank:a frank:a
AE-NG|hang:v gang slang rang:p bang
AE-P-IY|happy:a snappy:a scrappy:a
AH-N|run:v done:p one none son sun gun fun begun:p everyone anyone
AH-N-IY|money funny:a honey sunny:a bunny runny:a
AH-N-IH-NG|running cunning:a stunning:a
AH-M-IH-NG|coming drumming humming becoming numbing
AH-TH-IH-NG|nothing something
AH-V|love above:r glove shove:v
AH-K|luck truck stuck:a struck:p duck
AH-S-T|trust must:p dust just:r adjust:v
AH-D|blood flood mud bud stud
AH-M|come:v from some become:v sum numb:a drum overcome:v
AH-T|cut:v but shut:v gut
AH-S-AH-L|hustle muscle tussle
AH-B-AH-L|trouble double:a bubble rubble
AH-M-B-AH-L|humble:a crumble:v tumble:v stumble:v rumble mumble:v
AH-F|enough:r tough:a rough:a stuff bluff cuff
AH-N-T|front hunt:v blunt:a confront:v
AH-N-CH|punch lunch crunch bunch munch:v
AH-N-D-ER|under:r wonder:v thunder blunder plunder
AH-N-ER|runner gunner stunner
AH-M-ER|summer drummer bummer
AH-M-B-ER|number slumber lumber
AH-NG|young:a lung tongue hung:p sung:p among:r
AH-NG-K|junk drunk:a trunk sunk:p monk shrunk:p
AH-K-IY|lucky:a unlucky:a
AH-N-D-R-AH-D|hundred hundreds:l
AA-T|got:p hot:a spot shot lot not:r plot forgot:p jackpot robot
AA-P|top drop:v stop:v shop hop:v cop nonstop:a workshop
AA-K|rock block lock:v clock shock knock:v stock unlock:v
AA-R-T|heart start:v part art chart apart:r smart:a depart:v
AA-R-K|dark:a mark spark park
AA-R-D|hard:a guard card yard regard discard:v
AA-R-M|arm harm charm alarm
AA-S|boss loss cross:v toss:v across:r
AA-N|on:r gone upon:r
AA-D-IY|body somebody everybody nobody anybody
AA-L-ER|dollar collar scholar holler:v
AA-T-AH-M|bottom
AA-R-IY|sorry:a starry:a
AO-L|all:r call:v fall:v small:a wall tall:a ball install:v recall:v
AO-T|thought bought:p caught:p taught:p fought:p brought:p ought:p
AO-R|more:r door floor four war score store before:r ignore:v explore:v restore:v therefore:r hardcore:a
AO-Z|cause because:r laws:l pause:v applause flaws:l
AO-NG|song long:a wrong:a strong:a belong:v along:r headstrong:a
AO-T-ER|water daughter slaughter
OW|go:v know:v show:v flow slow:a grow:v throw:v low:a so:r no:r though:r below:r although:r tempo solo studio radio video
OW-L|soul goal whole:a role control patrol console:v stole:p
OW-L-D|cold:a told:p hold:v gold bold:a sold:p old:a controlled:p unfold:v
OW-N|alone:r zone phone own:v known:p thrown:p grown:p throne stone tone unknown:a backbone microphone
OW-D|road code mode load explode:v overload
OW-T|wrote:p quote note float:v boat coat vote:v remote:a promote:v devote:v
OW-Z|chose:p close:a those rose nose suppose:v oppose:v propose:v compose:v expose:v
OW-P|hope dope:a scope rope cope:v
OW-K|broke:a spoke:p smoke woke:p joke provoke:v
OW-M|home chrome dome roam:v syndrome
OW-V-ER|over:r sober:a
OW-SH-AH-N|motion ocean emotion promotion devotion notion commotion
OW-IH-NG|going flowing knowing growing showing throwing
UW|you do:v true:a blue:a through:r new:a few:a view crew knew:p grew:p threw:p screw:v clue due:a pursue:v breakthrough avenue tattoo review
UW-Z|lose:v choose:v news:l blues:l shoes:l use:v confuse:v refuse:v abuse excuse
UW-V|move:v prove:v groove improve:v approve:v remove:v
UW-T|shoot:v root boot route pursuit recruit dispute absolute:a
UW-L|cool:a rule school fool tool jewel
UW-M|room bloom:v doom assume:v consume:v resume costume
UW-TH|truth youth booth
UW-N|soon:r moon tune June cartoon afternoon balloon
ER|her sir blur:v occur:v prefer:v transfer refer:v
ER-D|word heard:p bird third:a absurd:a blurred:a
ER-K|work jerk
ER-L-D|world curled:p hurled:p
ER-N|turn:v learn:v burn:v earn:v concern return:v
ER-S|worse:a curse verse universe rehearse:v nurse reverse:v immerse:v
ER-S-T|first:a worst:a thirst burst:v cursed:a rehearsed:p
ER-T|hurt:v dirt alert:a convert:v expert insert:v dessert
ER-V|nerve serve:v curve deserve:v preserve:v observe:v
ER-IY|worry:v hurry:v blurry:a
AW|now:r how:r wow allow:v somehow:r
AW-N|down:r town crown brown:a
AW-N-D|sound around:r found:v ground round:a pound underground:a background surround:v profound:a
AW-T|out:r about:r doubt shout:v without:r throughout:r
AW-ER|power hour tower flower shower devour:v
OY|boy joy destroy:v employ:v enjoy:v deploy:v
OY-N|coin join:v
OY-S|voice choice rejoice:v
UH-D|good:a would:p could:p should:p hood wood stood:p understood:a neighbourhood misunderstood:a
UH-K|look:v book took:p shook:p cook:v hook overlook:v
UH-L|full:a pull:v bull
AE-N-D-IH-NG|standing landing understanding demanding commanding
AH-DH-ER|other mother brother another:a bother:v
AH-V-ER|lover cover:v discover:v recover:v undercover:a
IH-V-ER|river deliver:v forgiver quiver:v
AO-R-T|sport short:a court report support:v resort effort comfort
AO-R-S|force source course endorse:v remorse
IY-V-ER|fever believer receiver achiever forever:r
EY-T-ER|later:r greater:a waiter traitor creator
EY-P-ER|paper vapour taper caper
EY-V-ER|favour flavour saviour behaviour
EY-B-ER|labour neighbour
IH-M-P-AH-L|simple:a temple example
AA-D-AH-L|model bottle throttle
EH-R|there:r where:r care:v share:v swear:v air fair:a rare:a prepare:v aware:a compare:v repair:v stare:v beware:v
UH-R|sure:a pure:a cure endure:v secure:a mature:a
`;

const TOPIC_SEEDS: Record<TopicId, string> = {
  money: 'money paper cash dollar bank hundred hundreds bill bills stack stacks check profit rich broke spend paid pay budget invest price worth cost salary rent debt gold coin currency wealth income',
  ambition: 'grind hustle goal goals dream dreams climb rise chase win winner success succeed build vision plan future ahead higher top level up motivate drive focus push aim achieve',
  struggle: 'struggle pain hard hurt lost lose fall fail cold dark trouble stress pressure heavy weight fight survive bleed broken tired worry doubt down burden',
  confidence: 'confidence king crown throne best greatest untouchable fearless bold nerve proud stand tall own flex bars nobody doubt prove sharp cold-blooded unstoppable elite legend',
  city: 'city block street streets corner concrete downtown town neighbourhood hood avenue train bus lights traffic skyline bridge alley pavement underground rooftop',
  time: 'time clock hour minute second late early night morning today tomorrow yesterday moment forever never always day days year years season timing waiting',
  love: 'love heart feel feeling miss kiss lonely alone together her him soul care trust honest hold close leave stay real',
  party: 'party club dance floor lights speaker bass loud night out crowd drink celebrate vibe energy move jump wild',
  family: 'family mother father brother sister son daughter home blood kids children raise roots name legacy elders house',
  mind: 'mind head thoughts think brain memory dream focus mental clarity conscious deep peace calm anxiety silence wisdom knowledge',
  craft: 'flow bars rhyme verse mic beat booth studio record track lyrics freestyle cadence pen write pattern sound rhythm tempo microphone',
};

const TOPIC_LOOKUP: Map<string, TopicId[]> = (() => {
  const map = new Map<string, TopicId[]>();
  (Object.keys(TOPIC_SEEDS) as TopicId[]).forEach((topic) => {
    for (const raw of (TOPIC_SEEDS[topic] ?? '').split(/\s+/)) {
      const word = normaliseWord(raw);
      if (!word) continue;
      const existing = map.get(word);
      if (existing) existing.push(topic);
      else map.set(word, [topic]);
    }
  });
  return map;
})();

function parseFamilies() {
  const byKey = new Map<string, LexEntry[]>();
  const byWord = new Map<string, LexEntry>();

  for (const line of FAMILIES.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.includes('|')) continue;
    const [key, wordBlob] = trimmed.split('|');
    if (!key || !wordBlob) continue;

    const entries: LexEntry[] = [];
    wordBlob.split(/\s+/).forEach((token, index) => {
      const [rawWord, posTag] = token.split(':');
      const word = normaliseWord(rawWord ?? '');
      if (!word) return;
      const pos: PartOfSpeech =
        posTag === 'v' || posTag === 'a' || posTag === 'r' ||
        posTag === 'p' || posTag === 'l'
          ? posTag
          : 'n';
      const entry: LexEntry = {
        word,
        key,
        pos,
        syllables: countSyllables(word),
        topics: TOPIC_LOOKUP.get(word) ?? [],
        rank: index,
      };
      entries.push(entry);
      // First definition wins so the most natural family keeps the word.
      if (!byWord.has(word)) byWord.set(word, entry);
    });

    const existing = byKey.get(key);
    if (existing) existing.push(...entries);
    else byKey.set(key, entries);
  }

  return { byKey, byWord };
}

const { byKey, byWord } = parseFamilies();

export const LEXICON_SIZE = byWord.size;
export const FAMILY_COUNT = byKey.size;

/** All rhyme keys:l present in the lexicon, for scanning near matches. */
export const ALL_KEYS: string[] = Array.from(byKey.keys());

export function lookupEntry(word: string): LexEntry | undefined {
  return byWord.get(normaliseWord(word));
}

export function familyFor(key: string): LexEntry[] {
  return byKey.get(key) ?? [];
}

/** Topics a single word points at, for transcript topic detection. */
export function topicsForWord(word: string): TopicId[] {
  return TOPIC_LOOKUP.get(normaliseWord(word)) ?? [];
}

export function isKnownWord(word: string): boolean {
  const w = normaliseWord(word);
  return byWord.has(w) || TOPIC_LOOKUP.has(w);
}
