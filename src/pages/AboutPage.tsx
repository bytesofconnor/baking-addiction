import { Flourish } from "@/components/Flourish";
import { Kicker } from "@/components/Kicker";
import { PageTitle } from "@/lib/pageTitle";
import { BAKER_FULL_NAME, SITE_SHORT } from "@/lib/site";

export function AboutPage() {
  return (
    <div className="max-w-[46rem] xl:max-w-[52rem]">
      <PageTitle title={`About · ${SITE_SHORT}`} />
      <Kicker>{BAKER_FULL_NAME}</Kicker>
      <h1 className="font-display mt-3 text-[2.8rem] leading-[1.08] tracking-tight">
        This is my cookbook
      </h1>
      <figure className="-mx-1 mt-6 mb-1">
        <img
          src="/chris-loves-sketch.png"
          alt="Notebook doodles of baking, coffee, a Minnesota lake, a plane, a book, an apple, and the beach"
          className="page-sketch w-full"
        />
      </figure>
      <p className="drop-cap mt-7">
        Call me Chris. I teach first grade. I&apos;m a mom of three, a wife,
        and grandma to our dog, Zuma.
      </p>
      <p className="mt-5">
        I don&apos;t really stay in one lane. Cookies, cupcakes, gourmet
        cakes. Scones, muffins, granola bars, homemade bagels, a blueberry
        French toast bake. Pasta, pizza, calzones, pasta salad. Enchiladas,
        taco bars, salsa. Chickpea burgers. Vietnamese bowls. If people are
        coming over, I&apos;m already in the kitchen.
      </p>
      <p className="mt-5">
        I bake from{" "}
        <a
          href="https://sallysbakingaddiction.com"
          className="text-ink underline decoration-rule decoration-2 underline-offset-[3px] transition-colors duration-150 hover:text-cinnamon-deep hover:decoration-cinnamon-deep active:text-cocoa active:decoration-cocoa"
        >
          Sally&apos;s Baking Addiction
        </a>
        . I have for years. Her recipes are the ones I trust — they work, they
        make sense, and they taste like something you want to make again. I
        don&apos;t rewrite her method. I start there, then I write down what I
        actually did in my kitchen: the extra spice, the thing I skipped, how
        it came out for my people.
      </p>
      <p className="mt-5">
        If you want her recipe, go to Sally. That&apos;s the real one. If you
        want my version, stay here.
      </p>
      <Flourish className="my-10 max-w-[16rem]" />
      <p className="font-display text-[1.35rem] leading-8 text-cocoa italic">
        Love from the kitchen,
        <br />
        Chris
      </p>
    </div>
  );
}
