import {
  Text,
  TextColor,
  TextSize,
  TextWeight,
} from "../../../shared/components/Text/index.ts";
import "./Page.css";

export function HomePage() {
  return (
    <main className="home-page">
      <div className="home-page__spine" aria-hidden="true" />
      <Text
        as="p"
        className="home-page__eyebrow"
        size={TextSize.Small}
        weight={TextWeight.Bold}
      >
        FORGEFIT / ATHLETIC ACADEMY
      </Text>

      <section className="home-page__title-block">
        <Text
          as="span"
          className="home-page__number"
          size={TextSize.Small}
          weight={TextWeight.Bold}
          color={TextColor.Accent}
        >
          01
        </Text>
        <Text
          as="h1"
          className="home-page__title"
          weight={TextWeight.ExtraBold}
        >
          TRAIN WITH
          <br />
          INTENT.
        </Text>
        <div className="home-page__rule" />
        <Text className="home-page__subtitle" weight={TextWeight.Semibold}>
          Performance is a discipline.
        </Text>
      </section>

      <section className="home-page__details">
        <Text
          className="home-page__label"
          size={TextSize.Small}
          weight={TextWeight.Bold}
          color={TextColor.Secondary}
        >
          FOUNDATION PROGRAM
        </Text>
        <Text className="home-page__body" size={TextSize.Large}>
          A precise framework for strength, conditioning and sustainable
          athletic progress.
        </Text>
        <a className="home-page__link" href="/members">
          <Text as="span" size={TextSize.Small} weight={TextWeight.Bold}>
            VER SOCIOS
          </Text>
        </a>
      </section>
    </main>
  );
}
