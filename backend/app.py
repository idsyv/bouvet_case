import json
import random

from flask import Flask, request
from flask_cors import CORS


NUMBER_OF_QUESTIONS = 5
FILE_PATH = "questions.json"

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app)

def get_questions_from_file():
    with open(FILE_PATH, "r", encoding="utf-8") as file:
        questions_data = json.load(file)

    return questions_data

def calculate_score(answers_obj):
    questions_data = get_questions_from_file()
    score = 0

    for answer in answers_obj:
        question_id = answer ["question_id"]
        chosen_option_id = answer["option_id"]

        # Hent spørsmålet og riktig svar
        question = questions_data[question_id]
        correct_option_id = question["correct_option"]

        # Sammenlign svar mot fasit, og evt. øk scoren
        if chosen_option_id == correct_option_id:
            score += 1

    return score


@app.route("/api/questions", methods=["GET"])
def get_questions():
    questions_data = get_questions_from_file()
    
    for index, question in enumerate(questions_data):
        # Legg til id på hvert object
        question["question_id"] = index

        # Legg til id på svaralternativer og gi tilfeldig rekkefølge
        mapped_options = []
        for option_index, option_text in enumerate(question["options"]):
            mapped_options.append({"id": option_index, "text": option_text})
        random.shuffle(mapped_options)
        question["options"] = mapped_options

        # Fjern fasitsvar
        del question["correct_option"]

    # Pass på at det velges et gyldig antall spørsmål
    n = min(NUMBER_OF_QUESTIONS, len(questions_data))

    # Velg n antall tilfeldige spørsmål
    random_questions = random.sample(questions_data, n)
        
    return random_questions


@app.route("/api/submit", methods=["POST"])
def handle_submit():
    answers = request.get_json()
    
    return {
        "score": calculate_score(answers)
    }