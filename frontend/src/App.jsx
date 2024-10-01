import { useState } from "react";
import "./App.css";

const BASE_URL = "http://localhost:5000/api";

function App() {
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);

  const fetchQuestions = async () => {
    // Hent liste med spørsmål fra APIet
    const response = await fetch(BASE_URL + "/questions");
    const questions = await response.json();

    setQuestions(questions);
    setCurrentQuestionIndex(0); // Vis det første spørsmålet
  };

  const changeAnswer = (questionId, optionId) => {
    // Legg til eller endre et svar
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const prevQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
  };

  const submitAnswers = () => {
    // Endre formatet på svar til det APIet forventer
    let mappedAnswers = [];
    for (let [question_id, option_id] of Object.entries(answers)) {
      mappedAnswers.push({
        question_id: parseInt(question_id),
        option_id,
      });
    }

    // Send svarene til APIet
    fetch(BASE_URL + "/submit", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify(mappedAnswers),
    })
      .then((response) => response.json())
      .then(setResult);
  };

  const resetState = () => {
    setResult(null);
    setAnswers({});
    setCurrentQuestionIndex(null);
  };

  // Hvis resultater finnes, vis disse
  if (result) {
    return (
      <div>
        <h2>{`Du fikk ${result.score} av ${questions.length} poeng!`}</h2>
        <button onClick={resetState}>Spill igjen</button>
      </div>
    );
  }

  // Quizen har ikke blitt startet enda
  if (currentQuestionIndex === null) {
    return (
      <div>
        <button onClick={fetchQuestions}>Start quiz</button>
      </div>
    );
  }

  // Quizen har blitt startet
  const currentQuestion = questions[currentQuestionIndex];
  return (
    <div>
      {/* Spørsmål */}
      <h2>{currentQuestion.question}</h2>

      {/* Valgalternativer */}
      {currentQuestion.options.map((option) => (
        <div key={option.id}>
          <input
            type="radio"
            value={option.id}
            checked={answers[currentQuestion.question_id] === option.id}
            onChange={() =>
              changeAnswer(currentQuestion.question_id, option.id)
            }
          />
          {option.text}
        </div>
      ))}

      {/* Knapper */}
      <div>
        {currentQuestionIndex > 0 && (
          <button onClick={prevQuestion}>Forrige</button>
        )}
        {currentQuestionIndex < questions.length - 1 ? (
          <button onClick={nextQuestion}>Neste</button>
        ) : (
          <button onClick={submitAnswers}>Send inn svar</button>
        )}
      </div>
    </div>
  );
}

export default App;
