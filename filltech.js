import mongoose from "mongoose";
import Technology from "./model/Technology.model.js"; // Adjust path as needed

const MONGO_URI = "mongodb://localhost:27017/projectCollaboration"; // update with your DB

const technologies = [
  { name: "HTML" },
  { name: "CSS" },
  { name: "JavaScript" },
  { name: "React" },
  { name: "Node.js" },
  { name: "Express.js" },
  { name: "MongoDB" },
  { name: "SQL" },
  { name: "Java" },
  { name: "Spring Boot" },
  { name: "Ruby" },         // fixed typo
  { name: "R" },
  { name: "Python" },       // fixed typo
  { name: "Perl" },         // fixed typo
  { name: "C" },
  { name: "NLP" },          // fixed typo
  { name: "AI" },
  { name: "ML" },
  { name: "C++" },
  { name: ".NET" },
  { name: "C#" },
  { name: "PostgreSQL" },   // better naming
  { name: "Azure" },
  { name: "MERN" },
  { name: "MEAN" },
];

const seedTechnologies = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    await Technology.deleteMany(); // optional: clears old data
    await Technology.insertMany(technologies);

    console.log("✅ Technologies seeded successfully");
  } catch (err) {
    console.error("❌ Error seeding technologies:", err);
  } finally {
    await mongoose.disconnect();
  }
};

seedTechnologies();
