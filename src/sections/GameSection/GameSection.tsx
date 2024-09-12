"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import Button from "@/components/Button/Button";
import Loader from "@/components/Loader/Loader";

import { AnswerType, QuestionType } from "@/types/QuestionType";

import SideBarInfoSection from "../SideBarInfoSection/SideBarInfoSection";
import s from "./GameSection.module.css";

interface Props {
  questions: QuestionType[];
}

const highlights = ["A", "B", "C", "D"]; // array for button variants

const GameSection = ({ questions }: Props) => {
  // current question is set in useEffect
  const [currentQuestion, setCurrentQuestion] = useState<QuestionType | null>(
    null,
  );
  // for disabling all the buttons when one is clicked and timeout is working
  const [clickedButton, setClickedButton] = useState(false);

  // for mobile and tablet versions
  const [isToggledSidebar, setIsToggledSidebar] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // check to avoid reference error to localStorage
      const localCurrentQuestion = localStorage.getItem("localCurrentQuestion");
      const getLocalCurrentQuestion = () => {
        if (localCurrentQuestion !== null) {
          // setting type to current question got from localStorage
          const parsedLocalQuestion: QuestionType =
            JSON.parse(localCurrentQuestion);
          // getting question from localstorage and finding it in existing array of questions
          const searchedQuestionIndex = questions.findIndex(
            (question) => question.prize === parsedLocalQuestion.prize,
          );
          // if there is question that is got from localstorage - return it as current question
          if (questions[searchedQuestionIndex]) {
            return questions[searchedQuestionIndex];
          } else {
            localStorage.removeItem("localCurrentQuestion");
            return questions[0];
          }
        }
        // if there is no question in existing array - start from the first question
        return questions[0];
      };
      setCurrentQuestion(getLocalCurrentQuestion());
    }
  }, [questions]);

  const handleClick = (answer: AnswerType) => {
    // function to redirect to end game page
    const finishGame = () => {
      router.push(`/end-game?sum=${currentQuestion?.prize}`);
      localStorage.removeItem("localCurrentQuestion");
      setClickedButton(false);
    };
    if (!answer.correct) {
      finishGame();
      return;
    } else {
      // if correct answer we check whether it is the last question
      // if yes, we redirect to end game page, if not - set next question
      const currentQuestionIndex = questions.findIndex(
        (question) => question.prize === currentQuestion?.prize,
      );
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestion(questions[currentQuestionIndex + 1]);
        if (typeof window !== undefined) {
          localStorage.setItem(
            "localCurrentQuestion",
            JSON.stringify(questions[currentQuestionIndex + 1]),
          );
        }
      } else {
        finishGame();
      }
      setClickedButton(false);
    }
  };

  // while useEffect is working returning loader
  if (!currentQuestion) return <Loader />;

  return (
    <main className={s.wrapper}>
      <section className={s.container}>
        <Image
          onClick={() => setIsToggledSidebar(true)}
          className={s.burger}
          alt="burger icon"
          src="/burgerIcon.svg"
          width={16}
          height={14}
        />
        <h2 className={s.title}>{currentQuestion.question}</h2>
        <div className={s.buttonsWrapper}>
          {currentQuestion.answers.map((answer, index) => (
            <Button
              disabled={clickedButton}
              setDisabled={setClickedButton}
              questions={questions}
              answer={answer}
              onClick={handleClick}
              key={answer.title}
            >
              <span className={s.highlight}>{highlights[index]}</span>
            </Button>
          ))}
        </div>
      </section>
      <SideBarInfoSection
        questions={questions}
        currentQuestion={currentQuestion}
        isToggled={isToggledSidebar}
        setIsToggled={setIsToggledSidebar}
      />
    </main>
  );
};

export default GameSection;
