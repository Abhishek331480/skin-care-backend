// const OpenAI = require("openai");

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const skinTest = async (req, res) => {
//   try {
//     const {
//       name,
//       age,
//       gender,
//       skinType,
//       concerns,
//       sensitivity,
//       currentRoutine,
//       budget,
//     } = req.body;

//     if (!name || !age || !skinType || !concerns) {
//       return res.status(400).json({
//         message: "Name, age, skin type and concerns are required",
//       });
//     }

//     const prompt = `
// You are a skincare advisor for an ecommerce skincare website.

// User details:
// Name: ${name}
// Age: ${age}
// Gender: ${gender || "Not specified"}
// Skin Type: ${skinType}
// Skin Concerns: ${concerns}
// Sensitivity: ${sensitivity || "Not specified"}
// Current Routine: ${currentRoutine || "Not specified"}
// Budget: ${budget || "Not specified"}

// Give a safe skincare analysis.
// Do not diagnose medical disease.
// Return only JSON with:
// {
//   "skinSummary": "",
//   "morningRoutine": [],
//   "nightRoutine": [],
//   "recommendedIngredients": [],
//   "avoidIngredients": [],
//   "extraTips": []
// }
// `;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       temperature: 0.7,
//     });

//     const result = JSON.parse(response.choices[0].message.content);

//     return res.status(200).json({
//       message: "Skin analysis generated successfully",
//       result,
//     });
//   } catch (error) {
//     console.log("AI SKIN TEST ERROR:", error);

//     // return res.status(500).json({
//     //   message: "Failed to generate skin analysis",
//     // });
//     return res.status(200).json({
//   message: "Skin analysis generated successfully",
//   result: {
//     skinSummary:
//       "Your skin appears oily and acne-prone. Focus on oil control and hydration.",

//     morningRoutine: [
//       "Gentle Cleanser",
//       "Niacinamide Serum",
//       "Oil-Free Moisturizer",
//       "SPF 50 Sunscreen",
//     ],

//     nightRoutine: [
//       "Cleanser",
//       "Salicylic Acid Serum",
//       "Moisturizer",
//     ],

//     recommendedIngredients: [
//       "Niacinamide",
//       "Salicylic Acid",
//       "Hyaluronic Acid",
//     ],

//     avoidIngredients: [
//       "Heavy Oils",
//       "Alcohol Based Products",
//     ],

//     extraTips: [
//       "Drink more water",
//       "Avoid touching your face frequently",
//       "Use sunscreen daily",
//     ],
//   },
// });
//   }
// };

// module.exports = {
//   skinTest,
// };

const productModel = require("../models/product.model");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const skinTest = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      skinType,
      concerns,
      sensitivity,
      currentRoutine,
      budget,
    } = req.body;

    if (!name || !age || !skinType || !concerns) {
      return res.status(400).json({
        message: "Name, age, skin type and concerns are required",
      });
    }

    const prompt = `
You are a skincare advisor for an ecommerce skincare website.

User details:
Name: ${name}
Age: ${age}
Gender: ${gender || "Not specified"}
Skin Type: ${skinType}
Skin Concerns: ${concerns}
Sensitivity: ${sensitivity || "Not specified"}
Current Routine: ${currentRoutine || "Not specified"}
Budget: ${budget || "Not specified"}

Give safe general skincare suggestions only.
Do not diagnose medical conditions.
Return ONLY valid JSON. No markdown. No code block.

JSON format:
{
  "skinSummary": "",
  "morningRoutine": [],
  "nightRoutine": [],
  "recommendedIngredients": [],
  "avoidIngredients": [],
  "extraTips": []
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(text);

    const concernWords = concerns
  .toLowerCase()
  .split(/,|and|\s+/)
  .map((word) => word.trim())
  .filter(Boolean);

let recommendedProducts = await productModel
  .find({
    $or: [
      {
        skinType: {
          $regex: new RegExp(`^${skinType}$`, "i"),
        },
      },
      {
        benefits: {
          $in: concernWords.map((word) => new RegExp(word, "i")),
        },
      },
      {
        ingredients: {
          $in: concernWords.map((word) => new RegExp(word, "i")),
        },
      },
      {
        description: {
          $in: concernWords.map((word) => new RegExp(word, "i")),
        },
      },
      {
        name: {
          $in: concernWords.map((word) => new RegExp(word, "i")),
        },
      },
    ],
  })
  .limit(4);

if (recommendedProducts.length === 0) {
  recommendedProducts = await productModel
    .find()
    .sort({
      rating: -1,
      totalSold: -1,
      createdAt: -1,
    })
    .limit(4);
}

   return res.status(200).json({
  message: "Skin analysis generated successfully",
  result,
  recommendedProducts,
});
  } catch (error) {
  console.log("FULL GEMINI ERROR:");
  console.log(error);

  return res.status(500).json({
    message: error.message || "Failed to generate skin analysis",
  });
}
};

module.exports = {
  skinTest,
};