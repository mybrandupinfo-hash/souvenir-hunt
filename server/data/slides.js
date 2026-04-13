export const slides = [
  {
    index: 0,
    title: "The Stone Giant",
    story:
      "Your hunt begins beneath the watch of a towering guardian. Legends say the Emperor left the first sign where hands have polished bronze for luck.",
    riddle:
      "Find the great statue at the edge of the old city. What is the first name of the bishop this giant represents?",
    hint: "Tourists rub the big toe for good fortune.",
    answers: ["grgur", "gregory"],
  },
  {
    index: 1,
    title: "The Northern Gate",
    story:
      "The trail turns toward the grand northern entrance, where stone once separated imperial order from the restless world outside.",
    riddle:
      "Stand before the Golden Gate. What metal is named in the gate's title?",
    hint: "It shines in the name, even if not in the stone.",
    answers: ["gold", "golden"],
  },
  {
    index: 2,
    title: "The Emperor's Path",
    story:
      "Within the palace walls, a straight Roman line cuts through the city like memory carved into stone.",
    riddle:
      "Walk the main north-south street. What ancient urban route are you following?",
    hint: "Roman cities often had a cardo and a decumanus.",
    answers: ["cardo", "cardo street"],
  },
  {
    index: 3,
    title: "Court of Echoes",
    story:
      "At the ceremonial heart of the palace, columns rise and voices bounce from stone. One silent witness stands far older than Rome itself.",
    riddle: "What ancient creature guards the Peristyle near the steps?",
    hint: "It came from Egypt long before tourists came to Split.",
    answers: ["sphinx", "egyptian sphinx"],
  },
  {
    index: 4,
    title: "Beneath the Palace",
    story:
      "Below the imperial chambers lie vaulted cellars where secrets were hidden from the sun and from men who asked too many questions.",
    riddle: "What lies beneath the palace halls where the hunt now leads you?",
    hint: "Think stone halls under the emperor's apartments.",
    answers: ["cellars", "basement", "underground cellars"],
  },
  {
    index: 5,
    title: "Toward the Sea",
    story:
      "The final clues drift toward salt air. The Emperor built for power, but the city survived by turning toward the water.",
    riddle:
      "What waterfront promenade in Split marks the final stretch of the hunt?",
    hint: "Palms, cafes, and open sea define this place.",
    answers: ["riva", "the riva"],
  },
  {
    index: 6,
    title: "The Hidden Reward",
    story:
      "At the edge of the hunt stands a map in metal and memory. Here, your path ends and the Emperor's secret becomes something you can hold.",
    riddle:
      "Enter the code word you receive when you collect the souvenir treasure.",
    hint: "This final answer is confirmed when the reward is in your hands.",
    answers: ["souvenir", "treasure"],
  },
];

export function getSlideByIndex(index) {
  return slides.find((slide) => slide.index === index) || null;
}
