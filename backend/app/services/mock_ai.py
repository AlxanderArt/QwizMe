import random

TOPIC_BANKS = {
    "biology": {
        "title": "Biology Essentials",
        "questions": [
            {
                "question_text": "What is the powerhouse of the cell?",
                "explanation": "Mitochondria generate most of the cell's ATP through oxidative phosphorylation.",
                "answers": [
                    {"text": "Mitochondria", "correct": True},
                    {"text": "Nucleus", "correct": False},
                    {"text": "Ribosome", "correct": False},
                    {"text": "Golgi apparatus", "correct": False},
                ],
            },
            {
                "question_text": "Which molecule carries genetic information?",
                "explanation": "DNA (deoxyribonucleic acid) stores the instructions for building proteins.",
                "answers": [
                    {"text": "DNA", "correct": True},
                    {"text": "RNA", "correct": False},
                    {"text": "ATP", "correct": False},
                    {"text": "Glucose", "correct": False},
                ],
            },
            {
                "question_text": "What process do plants use to convert sunlight into energy?",
                "explanation": "Photosynthesis converts light energy into chemical energy stored in glucose.",
                "answers": [
                    {"text": "Photosynthesis", "correct": True},
                    {"text": "Cellular respiration", "correct": False},
                    {"text": "Fermentation", "correct": False},
                    {"text": "Osmosis", "correct": False},
                ],
            },
            {
                "question_text": "What is the basic unit of life?",
                "explanation": "The cell is the smallest structural and functional unit of living organisms.",
                "answers": [
                    {"text": "Cell", "correct": True},
                    {"text": "Atom", "correct": False},
                    {"text": "Molecule", "correct": False},
                    {"text": "Organ", "correct": False},
                ],
            },
            {
                "question_text": "Which blood type is considered the universal donor?",
                "explanation": "Type O negative can be given to any blood type without causing a reaction.",
                "answers": [
                    {"text": "O negative", "correct": True},
                    {"text": "AB positive", "correct": False},
                    {"text": "A positive", "correct": False},
                    {"text": "B negative", "correct": False},
                ],
            },
            {
                "question_text": "What organ is responsible for filtering blood in the human body?",
                "explanation": "The kidneys filter waste products and excess fluid from the blood.",
                "answers": [
                    {"text": "Kidneys", "correct": True},
                    {"text": "Liver", "correct": False},
                    {"text": "Heart", "correct": False},
                    {"text": "Lungs", "correct": False},
                ],
            },
            {
                "question_text": "How many chromosomes do humans have?",
                "explanation": "Humans have 23 pairs of chromosomes, totaling 46.",
                "answers": [
                    {"text": "46", "correct": True},
                    {"text": "23", "correct": False},
                    {"text": "48", "correct": False},
                    {"text": "44", "correct": False},
                ],
            },
            {
                "question_text": "What is the largest organ in the human body?",
                "explanation": "The skin covers roughly 20 square feet and weighs about 8 pounds.",
                "answers": [
                    {"text": "Skin", "correct": True},
                    {"text": "Liver", "correct": False},
                    {"text": "Brain", "correct": False},
                    {"text": "Lungs", "correct": False},
                ],
            },
            {
                "question_text": "Which type of cell lacks a nucleus?",
                "explanation": "Prokaryotic cells (like bacteria) do not have a membrane-bound nucleus.",
                "answers": [
                    {"text": "Prokaryotic", "correct": True},
                    {"text": "Eukaryotic", "correct": False},
                    {"text": "Plant cells", "correct": False},
                    {"text": "Animal cells", "correct": False},
                ],
            },
            {
                "question_text": "What is the process by which cells divide?",
                "explanation": "Mitosis is the process of cell division that results in two identical daughter cells.",
                "answers": [
                    {"text": "Mitosis", "correct": True},
                    {"text": "Meiosis", "correct": False},
                    {"text": "Binary fission", "correct": False},
                    {"text": "Budding", "correct": False},
                ],
            },
        ],
    },
    "history": {
        "title": "World History",
        "questions": [
            {
                "question_text": "In which year did World War II end?",
                "explanation": "WWII ended in 1945 with Germany surrendering in May and Japan in September.",
                "answers": [
                    {"text": "1945", "correct": True},
                    {"text": "1944", "correct": False},
                    {"text": "1946", "correct": False},
                    {"text": "1943", "correct": False},
                ],
            },
            {
                "question_text": "Who was the first President of the United States?",
                "explanation": "George Washington served as the first U.S. president from 1789 to 1797.",
                "answers": [
                    {"text": "George Washington", "correct": True},
                    {"text": "Thomas Jefferson", "correct": False},
                    {"text": "John Adams", "correct": False},
                    {"text": "Benjamin Franklin", "correct": False},
                ],
            },
            {
                "question_text": "Which ancient civilization built the pyramids at Giza?",
                "explanation": "The ancient Egyptians constructed the Great Pyramids around 2560 BC.",
                "answers": [
                    {"text": "Ancient Egyptians", "correct": True},
                    {"text": "Romans", "correct": False},
                    {"text": "Greeks", "correct": False},
                    {"text": "Mesopotamians", "correct": False},
                ],
            },
            {
                "question_text": "What event is considered the start of the French Revolution?",
                "explanation": "The storming of the Bastille on July 14, 1789 marked the beginning of the revolution.",
                "answers": [
                    {"text": "Storming of the Bastille", "correct": True},
                    {"text": "Execution of Louis XVI", "correct": False},
                    {"text": "Tennis Court Oath", "correct": False},
                    {"text": "Reign of Terror", "correct": False},
                ],
            },
            {
                "question_text": "Which empire was ruled by Genghis Khan?",
                "explanation": "Genghis Khan founded and ruled the Mongol Empire, the largest contiguous land empire.",
                "answers": [
                    {"text": "Mongol Empire", "correct": True},
                    {"text": "Ottoman Empire", "correct": False},
                    {"text": "Roman Empire", "correct": False},
                    {"text": "Persian Empire", "correct": False},
                ],
            },
            {
                "question_text": "In which year did the Berlin Wall fall?",
                "explanation": "The Berlin Wall fell on November 9, 1989, symbolizing the end of the Cold War.",
                "answers": [
                    {"text": "1989", "correct": True},
                    {"text": "1991", "correct": False},
                    {"text": "1987", "correct": False},
                    {"text": "1990", "correct": False},
                ],
            },
            {
                "question_text": "Who discovered America in 1492?",
                "explanation": "Christopher Columbus reached the Americas in 1492, though indigenous peoples had lived there for millennia.",
                "answers": [
                    {"text": "Christopher Columbus", "correct": True},
                    {"text": "Amerigo Vespucci", "correct": False},
                    {"text": "Leif Erikson", "correct": False},
                    {"text": "Ferdinand Magellan", "correct": False},
                ],
            },
            {
                "question_text": "What was the Renaissance?",
                "explanation": "The Renaissance was a cultural movement from the 14th-17th century emphasizing art, science, and humanism.",
                "answers": [
                    {"text": "A cultural rebirth in Europe", "correct": True},
                    {"text": "A military campaign", "correct": False},
                    {"text": "A religious reformation", "correct": False},
                    {"text": "An economic depression", "correct": False},
                ],
            },
            {
                "question_text": "Which country was the first to land humans on the Moon?",
                "explanation": "The United States landed Apollo 11 astronauts on the Moon on July 20, 1969.",
                "answers": [
                    {"text": "United States", "correct": True},
                    {"text": "Soviet Union", "correct": False},
                    {"text": "China", "correct": False},
                    {"text": "United Kingdom", "correct": False},
                ],
            },
            {
                "question_text": "What ancient wonder was located in Babylon?",
                "explanation": "The Hanging Gardens of Babylon were one of the Seven Wonders of the Ancient World.",
                "answers": [
                    {"text": "Hanging Gardens", "correct": True},
                    {"text": "Colossus of Rhodes", "correct": False},
                    {"text": "Lighthouse of Alexandria", "correct": False},
                    {"text": "Temple of Artemis", "correct": False},
                ],
            },
        ],
    },
    "technology": {
        "title": "Technology & Computing",
        "questions": [
            {
                "question_text": "What does 'HTTP' stand for?",
                "explanation": "HyperText Transfer Protocol is the foundation of data communication on the web.",
                "answers": [
                    {"text": "HyperText Transfer Protocol", "correct": True},
                    {"text": "High Tech Transfer Protocol", "correct": False},
                    {"text": "HyperText Transmission Program", "correct": False},
                    {"text": "High Transfer Text Protocol", "correct": False},
                ],
            },
            {
                "question_text": "Who is considered the father of computer science?",
                "explanation": "Alan Turing formalized computation with the Turing machine concept.",
                "answers": [
                    {"text": "Alan Turing", "correct": True},
                    {"text": "Charles Babbage", "correct": False},
                    {"text": "Bill Gates", "correct": False},
                    {"text": "Steve Jobs", "correct": False},
                ],
            },
            {
                "question_text": "What programming language is known for its use in web browsers?",
                "explanation": "JavaScript is the primary language for client-side web scripting.",
                "answers": [
                    {"text": "JavaScript", "correct": True},
                    {"text": "Python", "correct": False},
                    {"text": "Java", "correct": False},
                    {"text": "C++", "correct": False},
                ],
            },
            {
                "question_text": "What does 'CPU' stand for?",
                "explanation": "The Central Processing Unit is the primary component for executing instructions.",
                "answers": [
                    {"text": "Central Processing Unit", "correct": True},
                    {"text": "Computer Personal Unit", "correct": False},
                    {"text": "Central Program Utility", "correct": False},
                    {"text": "Core Processing Unit", "correct": False},
                ],
            },
            {
                "question_text": "What year was the World Wide Web invented?",
                "explanation": "Tim Berners-Lee invented the World Wide Web in 1989 at CERN.",
                "answers": [
                    {"text": "1989", "correct": True},
                    {"text": "1991", "correct": False},
                    {"text": "1995", "correct": False},
                    {"text": "1985", "correct": False},
                ],
            },
            {
                "question_text": "What does 'RAM' stand for?",
                "explanation": "Random Access Memory is volatile memory used for temporary data storage.",
                "answers": [
                    {"text": "Random Access Memory", "correct": True},
                    {"text": "Read Access Memory", "correct": False},
                    {"text": "Rapid Access Module", "correct": False},
                    {"text": "Random Allocation Memory", "correct": False},
                ],
            },
            {
                "question_text": "Which company created the iPhone?",
                "explanation": "Apple Inc. released the first iPhone in 2007, revolutionizing smartphones.",
                "answers": [
                    {"text": "Apple", "correct": True},
                    {"text": "Samsung", "correct": False},
                    {"text": "Google", "correct": False},
                    {"text": "Microsoft", "correct": False},
                ],
            },
            {
                "question_text": "What is an algorithm?",
                "explanation": "An algorithm is a step-by-step procedure for solving a problem or performing a task.",
                "answers": [
                    {"text": "A step-by-step problem-solving procedure", "correct": True},
                    {"text": "A type of programming language", "correct": False},
                    {"text": "A computer hardware component", "correct": False},
                    {"text": "A type of database", "correct": False},
                ],
            },
            {
                "question_text": "What does 'SQL' stand for?",
                "explanation": "Structured Query Language is used to manage and query relational databases.",
                "answers": [
                    {"text": "Structured Query Language", "correct": True},
                    {"text": "Simple Question Language", "correct": False},
                    {"text": "Standard Query Logic", "correct": False},
                    {"text": "System Query Language", "correct": False},
                ],
            },
            {
                "question_text": "What is cloud computing?",
                "explanation": "Cloud computing delivers computing services over the internet instead of local hardware.",
                "answers": [
                    {"text": "Delivering computing services over the internet", "correct": True},
                    {"text": "Computing done in high altitudes", "correct": False},
                    {"text": "A type of weather prediction software", "correct": False},
                    {"text": "Storing data on USB drives", "correct": False},
                ],
            },
        ],
    },
    "science": {
        "title": "General Science",
        "questions": [
            {
                "question_text": "What is the chemical symbol for water?",
                "explanation": "Water is composed of two hydrogen atoms and one oxygen atom: H2O.",
                "answers": [
                    {"text": "H2O", "correct": True},
                    {"text": "CO2", "correct": False},
                    {"text": "NaCl", "correct": False},
                    {"text": "O2", "correct": False},
                ],
            },
            {
                "question_text": "What is the speed of light approximately?",
                "explanation": "Light travels at approximately 300,000 km/s in a vacuum.",
                "answers": [
                    {"text": "300,000 km/s", "correct": True},
                    {"text": "150,000 km/s", "correct": False},
                    {"text": "1,000,000 km/s", "correct": False},
                    {"text": "30,000 km/s", "correct": False},
                ],
            },
            {
                "question_text": "What force keeps planets in orbit around the Sun?",
                "explanation": "Gravity is the force of attraction between massive objects.",
                "answers": [
                    {"text": "Gravity", "correct": True},
                    {"text": "Magnetism", "correct": False},
                    {"text": "Friction", "correct": False},
                    {"text": "Nuclear force", "correct": False},
                ],
            },
            {
                "question_text": "What is the atomic number of carbon?",
                "explanation": "Carbon has 6 protons in its nucleus, giving it atomic number 6.",
                "answers": [
                    {"text": "6", "correct": True},
                    {"text": "12", "correct": False},
                    {"text": "8", "correct": False},
                    {"text": "14", "correct": False},
                ],
            },
            {
                "question_text": "What state of matter has a fixed volume but no fixed shape?",
                "explanation": "Liquids maintain their volume but take the shape of their container.",
                "answers": [
                    {"text": "Liquid", "correct": True},
                    {"text": "Gas", "correct": False},
                    {"text": "Solid", "correct": False},
                    {"text": "Plasma", "correct": False},
                ],
            },
            {
                "question_text": "What planet is known as the Red Planet?",
                "explanation": "Mars appears red due to iron oxide (rust) on its surface.",
                "answers": [
                    {"text": "Mars", "correct": True},
                    {"text": "Venus", "correct": False},
                    {"text": "Jupiter", "correct": False},
                    {"text": "Mercury", "correct": False},
                ],
            },
            {
                "question_text": "What is Newton's first law of motion?",
                "explanation": "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by a force.",
                "answers": [
                    {"text": "An object in motion stays in motion unless acted upon", "correct": True},
                    {"text": "Force equals mass times acceleration", "correct": False},
                    {"text": "Every action has an equal and opposite reaction", "correct": False},
                    {"text": "Energy cannot be created or destroyed", "correct": False},
                ],
            },
            {
                "question_text": "What is the most abundant gas in Earth's atmosphere?",
                "explanation": "Nitrogen makes up about 78% of Earth's atmosphere.",
                "answers": [
                    {"text": "Nitrogen", "correct": True},
                    {"text": "Oxygen", "correct": False},
                    {"text": "Carbon dioxide", "correct": False},
                    {"text": "Argon", "correct": False},
                ],
            },
            {
                "question_text": "What is the pH of pure water?",
                "explanation": "Pure water has a neutral pH of 7.",
                "answers": [
                    {"text": "7", "correct": True},
                    {"text": "0", "correct": False},
                    {"text": "14", "correct": False},
                    {"text": "1", "correct": False},
                ],
            },
            {
                "question_text": "What subatomic particle has a negative charge?",
                "explanation": "Electrons carry a negative electric charge and orbit the nucleus.",
                "answers": [
                    {"text": "Electron", "correct": True},
                    {"text": "Proton", "correct": False},
                    {"text": "Neutron", "correct": False},
                    {"text": "Photon", "correct": False},
                ],
            },
        ],
    },
    "geography": {
        "title": "World Geography",
        "questions": [
            {
                "question_text": "What is the largest continent by area?",
                "explanation": "Asia covers about 44.58 million km², making it the largest continent.",
                "answers": [
                    {"text": "Asia", "correct": True},
                    {"text": "Africa", "correct": False},
                    {"text": "North America", "correct": False},
                    {"text": "Europe", "correct": False},
                ],
            },
            {
                "question_text": "What is the longest river in the world?",
                "explanation": "The Nile River stretches approximately 6,650 km through northeastern Africa.",
                "answers": [
                    {"text": "Nile", "correct": True},
                    {"text": "Amazon", "correct": False},
                    {"text": "Mississippi", "correct": False},
                    {"text": "Yangtze", "correct": False},
                ],
            },
            {
                "question_text": "Which country has the largest population?",
                "explanation": "India surpassed China as the most populous country, with over 1.4 billion people.",
                "answers": [
                    {"text": "India", "correct": True},
                    {"text": "China", "correct": False},
                    {"text": "United States", "correct": False},
                    {"text": "Indonesia", "correct": False},
                ],
            },
            {
                "question_text": "What is the smallest country in the world?",
                "explanation": "Vatican City covers only 0.44 km², making it the world's smallest country.",
                "answers": [
                    {"text": "Vatican City", "correct": True},
                    {"text": "Monaco", "correct": False},
                    {"text": "San Marino", "correct": False},
                    {"text": "Liechtenstein", "correct": False},
                ],
            },
            {
                "question_text": "What ocean is the largest?",
                "explanation": "The Pacific Ocean covers more area than all land surfaces combined.",
                "answers": [
                    {"text": "Pacific Ocean", "correct": True},
                    {"text": "Atlantic Ocean", "correct": False},
                    {"text": "Indian Ocean", "correct": False},
                    {"text": "Arctic Ocean", "correct": False},
                ],
            },
            {
                "question_text": "What is the tallest mountain in the world?",
                "explanation": "Mount Everest stands at 8,849 meters above sea level.",
                "answers": [
                    {"text": "Mount Everest", "correct": True},
                    {"text": "K2", "correct": False},
                    {"text": "Kangchenjunga", "correct": False},
                    {"text": "Mont Blanc", "correct": False},
                ],
            },
            {
                "question_text": "Which desert is the largest hot desert in the world?",
                "explanation": "The Sahara Desert covers about 9.2 million km² across North Africa.",
                "answers": [
                    {"text": "Sahara", "correct": True},
                    {"text": "Gobi", "correct": False},
                    {"text": "Arabian", "correct": False},
                    {"text": "Kalahari", "correct": False},
                ],
            },
            {
                "question_text": "What is the capital of Australia?",
                "explanation": "Canberra is the capital of Australia, not Sydney or Melbourne.",
                "answers": [
                    {"text": "Canberra", "correct": True},
                    {"text": "Sydney", "correct": False},
                    {"text": "Melbourne", "correct": False},
                    {"text": "Brisbane", "correct": False},
                ],
            },
            {
                "question_text": "Which continent is the driest?",
                "explanation": "Antarctica is technically the driest continent, receiving very little precipitation.",
                "answers": [
                    {"text": "Antarctica", "correct": True},
                    {"text": "Africa", "correct": False},
                    {"text": "Australia", "correct": False},
                    {"text": "Asia", "correct": False},
                ],
            },
            {
                "question_text": "What country has the most time zones?",
                "explanation": "France has 12 time zones due to its overseas territories.",
                "answers": [
                    {"text": "France", "correct": True},
                    {"text": "Russia", "correct": False},
                    {"text": "United States", "correct": False},
                    {"text": "United Kingdom", "correct": False},
                ],
            },
        ],
    },
    "literature": {
        "title": "Literature & Language",
        "questions": [
            {
                "question_text": "Who wrote 'Romeo and Juliet'?",
                "explanation": "William Shakespeare wrote Romeo and Juliet around 1594-1596.",
                "answers": [
                    {"text": "William Shakespeare", "correct": True},
                    {"text": "Charles Dickens", "correct": False},
                    {"text": "Jane Austen", "correct": False},
                    {"text": "Mark Twain", "correct": False},
                ],
            },
            {
                "question_text": "What is the first book of the Bible?",
                "explanation": "Genesis is the first book, describing the creation of the world.",
                "answers": [
                    {"text": "Genesis", "correct": True},
                    {"text": "Exodus", "correct": False},
                    {"text": "Psalms", "correct": False},
                    {"text": "Matthew", "correct": False},
                ],
            },
            {
                "question_text": "Who wrote '1984'?",
                "explanation": "George Orwell published 1984 in 1949 as a dystopian warning.",
                "answers": [
                    {"text": "George Orwell", "correct": True},
                    {"text": "Aldous Huxley", "correct": False},
                    {"text": "Ray Bradbury", "correct": False},
                    {"text": "H.G. Wells", "correct": False},
                ],
            },
            {
                "question_text": "What literary device gives human qualities to non-human things?",
                "explanation": "Personification attributes human characteristics to animals, objects, or ideas.",
                "answers": [
                    {"text": "Personification", "correct": True},
                    {"text": "Metaphor", "correct": False},
                    {"text": "Simile", "correct": False},
                    {"text": "Hyperbole", "correct": False},
                ],
            },
            {
                "question_text": "Who wrote 'The Great Gatsby'?",
                "explanation": "F. Scott Fitzgerald published The Great Gatsby in 1925.",
                "answers": [
                    {"text": "F. Scott Fitzgerald", "correct": True},
                    {"text": "Ernest Hemingway", "correct": False},
                    {"text": "John Steinbeck", "correct": False},
                    {"text": "William Faulkner", "correct": False},
                ],
            },
            {
                "question_text": "What is a haiku?",
                "explanation": "A haiku is a Japanese poem with three lines of 5, 7, and 5 syllables.",
                "answers": [
                    {"text": "A three-line poem with 5-7-5 syllable structure", "correct": True},
                    {"text": "A long narrative poem", "correct": False},
                    {"text": "A 14-line poem", "correct": False},
                    {"text": "A rhyming couplet", "correct": False},
                ],
            },
            {
                "question_text": "Who is the author of the Harry Potter series?",
                "explanation": "J.K. Rowling wrote the seven Harry Potter novels from 1997 to 2007.",
                "answers": [
                    {"text": "J.K. Rowling", "correct": True},
                    {"text": "C.S. Lewis", "correct": False},
                    {"text": "J.R.R. Tolkien", "correct": False},
                    {"text": "Roald Dahl", "correct": False},
                ],
            },
            {
                "question_text": "What is the term for a story's main character?",
                "explanation": "The protagonist is the central character around whom the plot revolves.",
                "answers": [
                    {"text": "Protagonist", "correct": True},
                    {"text": "Antagonist", "correct": False},
                    {"text": "Narrator", "correct": False},
                    {"text": "Deuteragonist", "correct": False},
                ],
            },
            {
                "question_text": "Which novel begins with 'Call me Ishmael'?",
                "explanation": "Moby-Dick by Herman Melville opens with this iconic line.",
                "answers": [
                    {"text": "Moby-Dick", "correct": True},
                    {"text": "The Old Man and the Sea", "correct": False},
                    {"text": "Treasure Island", "correct": False},
                    {"text": "Robinson Crusoe", "correct": False},
                ],
            },
            {
                "question_text": "What does 'allegory' mean in literature?",
                "explanation": "An allegory is a narrative where characters and events symbolize broader themes.",
                "answers": [
                    {"text": "A story with a hidden symbolic meaning", "correct": True},
                    {"text": "A type of comedy", "correct": False},
                    {"text": "A historical account", "correct": False},
                    {"text": "A poem about nature", "correct": False},
                ],
            },
        ],
    },
}


def generate_quiz_from_image(filename: str) -> dict:
    """Generate a mock quiz based on the uploaded image filename.

    In a real implementation, this would send the image to an AI model.
    For now, it selects a random topic and generates a quiz from the bank.
    """
    topic_key = random.choice(list(TOPIC_BANKS.keys()))
    topic = TOPIC_BANKS[topic_key]

    all_questions = topic["questions"]
    num_questions = random.randint(5, min(8, len(all_questions)))
    selected = random.sample(all_questions, num_questions)

    questions = []
    for q in selected:
        shuffled_answers = q["answers"][:]
        random.shuffle(shuffled_answers)

        correct_index = next(
            i for i, a in enumerate(shuffled_answers) if a["correct"]
        )

        questions.append({
            "question_text": q["question_text"],
            "explanation": q["explanation"],
            "correct_answer_index": correct_index,
            "answers": [
                {"text": a["text"], "is_correct": a["correct"]}
                for a in shuffled_answers
            ],
        })

    return {
        "title": f"{topic['title']} (AI Generated)",
        "questions": questions,
    }
