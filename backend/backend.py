
import os
from dotenv import load_dotenv
from groq import Groq
from pathlib import Path

import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "Data"

app = Flask(__name__)

load_dotenv(BASE_DIR / ".env")
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)
CORS(app)



def load_students():
    # Load all six CSV files
    academic = pd.read_csv(DATA_DIR / "academic.csv")
    attendance = pd.read_csv(DATA_DIR / "attendance.csv")
    lms = pd.read_csv(DATA_DIR / "lms.csv")
    engagement = pd.read_csv(DATA_DIR / "engagement.csv")
    placement = pd.read_csv(DATA_DIR / "placement.csv")
    skills = pd.read_csv(DATA_DIR / "skills.csv")

    # Merge records using student_id
    data = academic

    for df in [
        attendance,
        lms,
        engagement,
        placement,
        skills
    ]:
        data = data.merge(
            df,
            on="student_id",
            how="left",
            validate="one_to_one"
        )

    # Return missing values as JSON null
    data = data.astype(object).where(
        pd.notna(data), None
    )

    return data


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "success",
        "message": "CampusPulse backend is running"
    })


@app.route("/api/students", methods=["GET"])
def get_students():
    try:
        data = load_students()
        
        # Answer exact attendance-list questions directly
        return jsonify(data.to_dict(orient="records"))
    except Exception as error:
        app.logger.exception("Unable to load student data")
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500


@app.route("/api/summary", methods=["GET"])
def get_summary():
    try:
        data = load_students()

        return jsonify({
            "total_students": len(data),
            "average_cgpa": round(
                float(data["cgpa"].mean()), 2
            ) if data["cgpa"].notna().any() else None,
            "average_attendance": round(
                float(data["attendance_pct"].mean()), 2
            ) if data["attendance_pct"].notna().any() else None
        })
    except Exception as error:
        app.logger.exception("Unable to calculate summary")
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    
@app.route("/api/ai-chat", methods=["POST"])

@app.route("/api/ai-chat", methods=["POST"])
def ai_chat():
    try:
        body = request.get_json(silent=True) or {}
        question = body.get("question", "").strip()

        if not question:
            return jsonify({
                "status": "error",
                "message": "Please enter a question."
            }), 400

        if len(question) > 2000:
            return jsonify({
                "status": "error",
                "message": "Question is too long. Please keep it under 2000 characters."
            }), 400

        # Load the real CampusPulse dataset
        data = load_students()
        
        # Answer exact attendance-list questions directly
        normalized_question = question.lower()

        if (
            "attendance" in normalized_question
            and (
                "student id" in normalized_question
                or "student ids" in normalized_question
                or "list the students" in normalized_question
            )
            and "75" in normalized_question
        ):
            low_attendance = data[
                data["attendance_pct"] < 75
            ][["student_id", "attendance_pct"]]

            answer = (
                f"Found {len(low_attendance)} students "
                "with attendance below 75%.\n\n"
                + "\n".join(
                    f"{row.student_id}: {row.attendance_pct}%"
                    for row in low_attendance.itertuples(index=False)
                )
            )

            return jsonify({
                "status": "success",
                "answer": answer
            })

        # Build a compact summary from available columns
        summary = {
            "total_students": len(data)
        }

        if "cgpa" in data.columns:
            summary["average_cgpa"] = (
                round(float(data["cgpa"].mean()), 2)
                if data["cgpa"].notna().any() else None
            )

        if "attendance_pct" in data.columns:
            summary["average_attendance"] = (
                round(float(data["attendance_pct"].mean()), 2)
                if data["attendance_pct"].notna().any() else None
            )
            summary["students_below_75_attendance"] = int(
                (data["attendance_pct"] < 75).sum()
            )

        # Share only relevant, limited student fields with the AI
        useful_columns = [
            "student_id",
            "department",
            "year",
            "cgpa",
            "attendance_pct",
            "engagement_score",
            "placement_readiness"
        ]

        available_columns = [
            column for column in useful_columns
            if column in data.columns
        ]

        student_records = data[available_columns].to_dict(
            orient="records"
        )
        
        # Calculate exact attendance results in Python
        low_attendance_students = []

        if "attendance_pct" in data.columns:
            low_attendance = data[
                data["attendance_pct"] < 75
            ]

            low_attendance_students = (
                low_attendance[
                    ["student_id", "attendance_pct"]
                ].to_dict(orient="records")
            )

        dataset_context = {
            "summary": summary,
            
            "student_records": student_records,
            "students_below_75_attendance": low_attendance_students
        }

        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are CampusPulse AI, a college student-success "
                        "analytics assistant. Use the supplied CampusPulse "
                        "dataset and summary to answer questions about "
                        "students. Use actual values for counts and averages. "
                        "Never invent statistics or student records. "
                        "If a requested field is unavailable, say so. "
                        "Use student IDs only, never invent student names. "
                        "Explain recommendations clearly and respectfully. "
                        "The data is a prototype dataset, not a validated "
                        "prediction system."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"CampusPulse dataset:\n{dataset_context}\n\n"
                        f"Question: {question}"
                    )
                }
            ],
            temperature=0.3,
            max_tokens=500
        )

        answer = response.choices[0].message.content

        return jsonify({
            "status": "success",
            "answer": answer
        })

    except Exception:
        app.logger.exception("CampusPulse AI request failed")
        return jsonify({
            "status": "error",
            "message": (
                "The AI request failed. Please check the backend "
                "configuration and try again."
            )
        }), 500
if __name__ == "__main__":
    app.run(debug=True, port=5000)
