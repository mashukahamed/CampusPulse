import streamlit as st
import pandas as pd

st.title("CampusPulse")
st.subheader("Smart Campus Analytics")

data_folder = "data/"

try:
    academic = pd.read_csv(data_folder + "academic.csv")
    attendance = pd.read_csv(data_folder + "attendance.csv")
    lms = pd.read_csv(data_folder + "lms.csv")
    engagement = pd.read_csv(data_folder + "engagement.csv")
    placement = pd.read_csv(data_folder + "placement.csv")
    skills = pd.read_csv(data_folder + "skills.csv")

    df = academic

    for dataset in [attendance, lms, engagement, placement, skills]:
        df = df.merge(dataset, on="student_id", how="left")

    st.success("All six datasets loaded successfully!")

    st.metric("Total Students", df["student_id"].nunique())

    st.write("Combined Student Data")
    st.dataframe(df)

except Exception as e:
    st.error(f"Error loading data: {e}")