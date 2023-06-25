// Declarations
const fs = require("fs");
const readline = require("readline");
let raw_data = fs.readFileSync('./pieces.json');
let pieces = JSON.parse(raw_data);
let opening_data = fs.readFileSync("./openings.json");
let openings = JSON.parse(opening_data);
let Question_data = fs.readFileSync('./Questions.json');
let questions = JSON.parse(Question_data);
let more = 0;
let limit = 0;
let ans_buffer = []

async function answer(keywords) {
    ans_buffer = [];
    more = 0;
    console.log(keywords["size"])
    if (keywords["piece"].length === 1) {
        let t = keywords["piece"][0].charAt(0).toUpperCase() + keywords["piece"][0].slice(1); //Change piece name to upper case for navigate json
        if (keywords["piece operator"].includes("move")) {
            return "The " + t + " " + pieces["White"][t]["steps"] + "and " + pieces["White"][t]["direction"];
        } else if (keywords["piece operator"].includes("special")) {
            return "The " + t + pieces["White"][t]["Special_Move"] + pieces["White"][t]["extended"];
        } else if (keywords["piece operator"].includes("direction")) {
            return "The " + t + pieces["White"][t]["direction"];
        } else if (["steps"].some(val => keywords["piece operator"].includes(val))) {
            return "The " + t + pieces["White"][t]["steps"];
        } else if (["position", "placed", "place", "start", "put"].some(val => keywords["piece operator"].includes(val))) {
            return "The " + t + "'s starting position is " + pieces["White"][t]["Current_Position"] + " for white";
        } else if (["worth", "value", "points"].some(val => keywords["piece operator"].includes(val))) {
            return "The " + t + pieces["White"][t]["points"];
        } else if (["capture", "take"].some(val => keywords["piece operator"].includes(val))) {
            return "The " + t + pieces["White"][t]["capturing"];
        } else if (keywords["size"] === 2) {
            return "Yes, the " + t + " is one of the pieces but, " + questions["not_understanding"][any_element(questions["not_understanding"].length)];
        }
    }
    if (keywords["rule_book"].length >= 1) {
        ans_buffer = await searchFile([keywords["piece"], keywords["piece operator"], keywords["rule_book"]].flat());
        limit = ans_buffer.length;
        return ans_buffer[more]
    }

} //called directly from Handler. First checks if keywords match Pieces.json and if not the searches Rule.txt
function bot_answer(question) {
    let ans = []
    ans[0] = "";
    let ans_start = "";//questions["positive_answer"][any_element(questions["positive_answer"].length)]
    if (question === "A1") {
        ans_start = ans_start + ". I'll do the white pieces and lets see if you can do the black pieces."
        for (let i in pieces.White) {
            for (let j in pieces.White[i].Current_Position) {
                ans.push(i + " " + pieces.White[i].Current_Position[j]);
            }
        }
    } else if (question === "A2") {
        for (let i in pieces.White) {
            ans.push("The " + i + " " + pieces.White[i].steps + " ");
            for (let j in pieces.White[i].direction) {
                ans.push("The " + i + " " + pieces.White[i].direction[j]);
            }
        }
    } else if (question === "A3") {
        ans_start = ans_start + " Ah, you want the special moves, you are going to have to pick the one you like the most. \n";
        for (let i in pieces.White) {
            if (pieces.White[i].Special_Move !== "") {
                ans.push(" " + "The " + i + " is: " + pieces.White[i].Special_Move + "  \n");
            }
        }
    } else if (question === "A4") {
        ans_start = ans_start + " I'll start with the king ";
        for (let i in pieces.White) {
            if (pieces.White[i].extended !== "") {
                ans.push(pieces.White[i].extended);
            }
        }
    } else if (question === "A5") {
        for (let i = 0; i < 30; i++) {
            ans.push(openings["opening"][any_element(openings["opening"].length)]);
        }
    } else if (question === "A6") {
        for (let i in questions["etiquette"]) {
            ans.push(i);
        }
    } else if (question === "A99") {
        ans.push(questions["agim"][any_element(questions["agim"].length)]);
    }
    ans[0] = ans_start;
    ans_buffer = [];
    ans_buffer = ans;
    limit = ans.length;
    more = 1;
    return ans[0] + " " + ans[1] + " shall I continue? ";
} //bot answers to predetermined questions, needs to be expanded
function next_ans() {
    more++;
    if (more === limit - 1) {
        return "Lastly: " + ans_buffer[more];
    } else if (more < ans_buffer.length - 1) {
        return ans_buffer[more] + "," + questions["more"][any_element(questions["more"].length)];
    } else return questions["change_subject"][any_element(questions["change_subject"].length)];
} //Iterates through the answers already found.
async function searchFile(keywords, file = "Rule.txt") {
    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let found = [];
    let res = 0;
    let keep = false;
    for await (const line of rl) {
        if (keep) {
            found[res].push(line.slice(0, -1));
            if (line[line.length - 1] === ".") {
                res++;
                keep = false;
            }
        }
        if (!keep) {
            for (let keyword of keywords) {
                if (line.includes(keyword)) {
                    found[res] = [];
                    if (line[line.length - 1] === "-") {
                        keep = true;
                        found[res].push(line.slice(0, -1))
                        break;
                    }
                }
            }
        }

    }
    let max = 0;
    let ans = "";
    for (i of found) {
        let val = score(keywords, i)
        if (max < val) {
            ans = i;
            max = val;
        }
    }
    return ans
} //search for keywords in Rule.txt. is line by line search
function any_element(arr_len) {
    return Math.floor(Math.random() * arr_len);
} //return random element in an array

function score(keyword, from_file) {

    let val = 0;
    let max = 0;
    for (let j of from_file) {
        let s = j.split(" ");
        val = 0;
        let half = Math.floor(s.length / 2);
        for (let i of keyword) {
            let pos = s.indexOf(i)
            if (pos >= 0) {
                if (pos <= half) {
                    val++;
                }
                val++;
            }
        }
        if (val > max) {
            max = val;
        }
    }
    return max
} //ranks the results of the search based on how early keywords is found: earlier is better

function grammar_handler(keywords, words) {//"can", "is", "does", "will", "should", "could", "would", "how", "why", "when", "what", "which", "will", "mean"
    if (["when", "can", "could", "would"].some(val => words.includes(val))) {
        keywords["rule_book"].push("the");
        keywords["rule_book"].push("a");
        keywords["rule_book"].push("when")
        keywords["rule_book"].push("can");
        keywords["size"] += 4;
    }
    if (["what", "does", "is"].some(val => words.includes(val))) {
        keywords["rule_book"].push("the");
        keywords["rule_book"].push("is")
        keywords["rule_book"].push("are");
        keywords["rule_book"].push("a");
        keywords["size"] += 5;
    }
    return keywords;
} //depending on connectors, adds more value to the, to be optimised "score(keyword, from_file)"

module.exports = {answer, bot_answer, next_ans};
