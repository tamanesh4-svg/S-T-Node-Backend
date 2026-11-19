
// controllers/resultController.js

const Class = require("../models/class");
const Result = require("../models/Result");
const Student = require("../models/student");
const Attendance = require("../models/Attendance");

const CA_MAX_MARKS = 25;
const CA_FIELDS = ["ca1", "ca2", "ca3", "ca4"];

// ================= GET TEACHER CLASSES =================
exports.getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({
      teacher: req.teacher.id,
    });

    res.json(
      classes.map((c) => ({
        id: c._id,
        name: c.className,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET STUDENTS + EXISTING CA MARKS =================
exports.getStudentsByClass = async (req, res) => {
  try {
    const classId = req.params.id;

    const classData = await Class.findOne({
      _id: classId,
      teacher: req.teacher.id,
    }).populate("students", "name roll");

    if (!classData) {
      return res.status(404).json({
        message: "Class not found",
      });
    }

    const existingResult = await Result.findOne({
      class: classId,
      teacher: req.teacher.id,
    });

    const students = classData.students.map((student, index) => {
      const previous = existingResult?.results.find(
        (r) => r.student.toString() === student._id.toString()
      );

      const studentData = {
        id: student._id,
        name: student.name,
        roll: student.roll || index + 1,
      };

      CA_FIELDS.forEach((field) => {
        studentData[field] = previous?.[field]?.marks ?? "";
      });

      return studentData;
    });

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= SAVE FOUR CA RESULTS =================
exports.saveResults = async (req, res) => {
  try {
    const { classId, students } = req.body;

    if (!classId || !Array.isArray(students)) {
      return res.status(400).json({
        message: "classId and students are required",
      });
    }

    const classData = await Class.findOne({
      _id: classId,
      teacher: req.teacher.id,
    });

    if (!classData) {
      return res.status(404).json({
        message: "Class not found for this teacher",
      });
    }

    const classStudentIds = new Set(
      classData.students.map((id) => id.toString())
    );

    const submittedIds = new Set();

    const formatted = [];

    for (const student of students) {
      if (
        !student.id ||
        !classStudentIds.has(String(student.id)) ||
        submittedIds.has(String(student.id))
      ) {
        return res.status(400).json({
          message: "Invalid or duplicate student in submitted results",
        });
      }

      submittedIds.add(String(student.id));

      const studentResult = {
        student: student.id,
      };

      for (const field of CA_FIELDS) {
        const value = student[field];

        // Empty input means marks have not been entered yet.
        if (value === "" || value === null || value === undefined) {
          studentResult[field] = {
            marks: null,
            maxMarks: CA_MAX_MARKS,
          };
          continue;
        }

        const marks = Number(value);

        if (
          !Number.isFinite(marks) ||
          marks < 0 ||
          marks > CA_MAX_MARKS
        ) {
          return res.status(400).json({
            message: `${field.toUpperCase()} marks must be between 0 and ${CA_MAX_MARKS}`,
          });
        }

        studentResult[field] = {
          marks,
          maxMarks: CA_MAX_MARKS,
        };
      }

      formatted.push(studentResult);
    }

    const result = await Result.findOneAndUpdate(
      {
        class: classId,
        teacher: req.teacher.id,
      },
      {
        $set: {
          class: classId,
          teacher: req.teacher.id,
          results: formatted,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      message: "CA results saved successfully",
      result,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ================= GET STUDENT'S RESULT =================

// ================= GET STUDENT RESULT + ML PREDICTION =================
exports.getMyResult = async (req, res) => {
  try {
    const studentId = req.student.id;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const resultDoc = await Result.findOne({
      "results.student": studentId,
    }).populate("class");

    if (!resultDoc) {
      return res.json({
        name: student.name,
        roll: student.roll,
        className: "",
        subjects: [],
        prediction: {
          available: false,
          message: "No CA results have been published yet.",
        },
      });
    }

    const studentResult = resultDoc.results.find(
      (r) => r.student.toString() === studentId.toString()
    );

    if (!studentResult) {
      return res.json({
        name: student.name,
        roll: student.roll,
        className: resultDoc.class?.className || "",
        subjects: [],
        prediction: {
          available: false,
          message: "No CA results found.",
        },
      });
    }

    // Get attendance records belonging to this student
    const attendanceRecords = await Attendance.find({
      "records.student": studentId,
    });

    let totalClasses = 0;
    let attendedClasses = 0;

    attendanceRecords.forEach((record) => {
      const studentAttendance = record.records.find(
        (item) =>
          item.student.toString() === studentId.toString()
      );

      if (studentAttendance) {
        totalClasses++;

        if (studentAttendance.status === "present") {
          attendedClasses++;
        }
      }
    });

    const attendancePercentage =
      totalClasses > 0
        ? (attendedClasses / totalClasses) * 100
        : null;

    // Prepare CA assessments
    const assessments = ["ca1", "ca2", "ca3", "ca4"].map(
      (field, index) => ({
        name: `CA ${index + 1}`,
        marks: studentResult[field]?.marks ?? null,
        maxMarks: studentResult[field]?.maxMarks ?? 25,
      })
    );

    const total = assessments.reduce(
      (sum, ca) => sum + (ca.marks ?? 0),
      0
    );

    const enteredAssessments = assessments.filter(
      (ca) => ca.marks !== null
    );

    const enteredTotal = enteredAssessments.reduce(
      (sum, ca) => sum + ca.marks,
      0
    );

    const enteredMaxTotal = enteredAssessments.reduce(
      (sum, ca) => sum + ca.maxMarks,
      0
    );

    const percentage =
      enteredMaxTotal > 0
        ? (enteredTotal / enteredMaxTotal) * 100
        : 0;

    // ================= ML PREDICTION =================

    const ca1 = studentResult.ca1?.marks;
    const ca2 = studentResult.ca2?.marks;
    const ca3 = studentResult.ca3?.marks;
    const ca4 = studentResult.ca4?.marks;

    let prediction = {
      available: false,
      message: "Waiting for CA1 marks to be published.",
    };

    // All four CAs completed: show actual total, no prediction
    if (
      ca1 !== null && ca1 !== undefined &&
      ca2 !== null && ca2 !== undefined &&
      ca3 !== null && ca3 !== undefined &&
      ca4 !== null && ca4 !== undefined
    ) {
      prediction = {
        available: false,
        completed: true,
        actualTotal: total,
        message: "All assessments completed. Your actual total is available.",
      };
    }

    // Predict only when attendance and CA1 are available
    else if (attendancePercentage !== null && ca1 !== null && ca1 !== undefined) {

      let stage = 1;

      if (ca2 !== null && ca2 !== undefined) {
        stage = 2;
      }

      if (ca3 !== null && ca3 !== undefined) {
        stage = 3;
      }

      // Prevent skipping an earlier CA
      if (
        (stage >= 2 && (ca1 === null || ca1 === undefined)) ||
        (stage >= 3 && (ca2 === null || ca2 === undefined))
      ) {
        prediction = {
          available: false,
          message: "Complete earlier assessments before prediction.",
        };
      } else {
        try {
          const mlPayload = {
            stage,
            attendance: Number(attendancePercentage),
            ca1: Number(ca1),
          };

          if (stage >= 2) {
            mlPayload.ca2 = Number(ca2);
          }

          if (stage >= 3) {
            mlPayload.ca3 = Number(ca3);
          }

          const mlResponse = await fetch(
            `${process.env.ML_SERVICE_URL || "http://127.0.0.1:8000"}/predict`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(mlPayload),
            }
          );

          if (!mlResponse.ok) {
            throw new Error(`ML service returned ${mlResponse.status}`);
          }

          const mlData = await mlResponse.json();

          prediction = {
            available: true,
            stage: mlData.stage,
            expectedTotal: mlData.expected_total,
            attendance: Number(attendancePercentage.toFixed(2)),
            message: `Expected total after CA${stage}`,
          };
        } catch (mlError) {
          console.error("ML prediction error:", mlError.message);

          prediction = {
            available: false,
            message: "Prediction service is temporarily unavailable.",
          };
        }
      }
    } else if (attendancePercentage === null) {
      prediction = {
        available: false,
        message: "Attendance data is not available yet.",
      };
    }

    // ================= SEND RESPONSE =================

    res.json({
      name: student.name,
      roll: student.roll,
      className: resultDoc.class?.className || "",
      subjects: [
        {
          subject: "Overall",
          assessments,
          total,
          maxTotal: 100,
          percentage,
          completedAssessments: enteredAssessments.length,
        },
      ],
      attendance: {
        totalClasses,
        attendedClasses,
        percentage:
          attendancePercentage === null
            ? null
            : Number(attendancePercentage.toFixed(2)),
      },
      prediction,
    });

  } catch (err) {
    console.error("getMyResult error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};
