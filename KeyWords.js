const readline = require('readline');
const fs = require("fs");
const board = require('./board.js');
const response = require("./Responses.js");
let key_terms = fs.readFileSync("./key_terms.json")
let rule_book = JSON.parse(key_terms);
let Question_data = fs.readFileSync('./Questions.json');
let questions = JSON.parse(Question_data);
let first_go = true;

// GLOBALS ---------------------------------------------------------------------------------------------------
let board_record = [];

const grammar = ["can", "is", "does", "will", "should", "could", "would", "how", "why", "when", "what", "which", "will",
    "mean"]
const instruction = ["record", "game", "review", "opening", "recording", "start", "old", "stop", "end", "begin",
    "agim", "hi", "hello", "ola", "hie", "bonjour", " greetings", "hallo"]
const piece = ["king", "queen", "bishop", "knight", "castle", "pawn"];
const piece_operator = ["move", "capture", "captured", "many", "start", "position", "place", "placed", "worth",
    "value", "direction", "put", "special", "points"];

let bot_question = 0;
let bot_raise = false;
let recording = false
let last_question = [];

async function conversation_handler(sentence = "") {
    let words = sentence.toLowerCase().replace(/[!@#$%^&*()+=<>?:"{},./;]/g, "").split(" ");
    let kw = find_keywords(words);
    // Bot questions and human answers and bot questions.---------------------------------
    let bot = bot_response(words);
    if (!(bot === "")) {
        return bot;
    }
    // Bot questions finished -------------------------------------------------------------
    // Human questions
    if (recording && bot_is_move(words)) {
        return "move recorded"
    }//Check if it is a move and the move is recorded:------------------
    if (kw["size"] < 1) {
        return questions["not_understanding"][any_element(questions["not_understanding"].length)];
    }// If keywords too few, ask repeat
    bot = bot_instruction(kw["instruction"]);
    if (!(bot === "")) {
        return bot;
    }// Check if it is an instruction and act accordingly
    let find = response.answer(kw)

    return find
} //handles all that chats and assigns them accordingly

function find_keywords(words) {
    let keywords = {"piece": [], "piece operator": [], "rule_book": [], "instruction": [], "size": 0}
    let t = [];
    for (let word of words) {
        if (piece.includes(word)) {
            keywords["piece"].push(word);
            keywords["size"]++;
        }
        if (piece_operator.includes(word)) {
            keywords["piece operator"].push(word);
            keywords["size"]++;
        }
        if (rule_book.look.includes(word)) {
            keywords["rule_book"].push(word);
            keywords["size"]++;
        }
        if (instruction.includes(word)) {
            keywords["instruction"].push(word);
            keywords["size"]++;
            // }if ((/[a-h]/i.test(word[0]) )&& (/[1-8]/i.test(word[1]))) {
            //     // need to decide!!
        }
    }
    return keywords
}//splits out keywords according to function


function bot_is_move(words) {
    let step = ["", "", "", ""];
    let j = 0;
    for (let word of words) {
        if ((/[a-h]/i.test(word[0])) && (/[1-8]/i.test(word[1])) && (j < 2)) {
            step[j] = word;
            j++;
        } else if ((word === "white") || (word === "Black")) {
            step[2] = word.charAt(0).toUpperCase() + word.slice(1);
        } else if (piece.includes(word)) {
            step[3] = word.charAt(0).toUpperCase() + word.slice(1);
        }
    }
    if (["castle", "castling"].some(val => words.includes(val)) && j > 0) {
        return board_record = (board.make_move(["castling", step]));
    } else if (step[0] !== "" && step[1] !== "" && step[2] !== "" && step[3] !== "") {
        return board_record = (board.make_move(["", step]));
    } else return null;
}//Checks if it is a move
function bot_instruction(instr) {
    //const instruction = ["record", "game", "review", "opening", "recording", "start", "old", "stop", "end", "begin"]
    if (instr.length >= 2) {
        if (["start", "begin"].some(val => instr.includes(val)) &&
            ["recording", "record", "game"].some(val => instr.includes(val))) {
            recording = true;
            return "I am now recording the moves you pass me. Remember I need this format: 'piece name' 'origin sqaure'" +
                " 'destination square'. \n In the case of castling, just say 'castle', then 'castle square'";
        }
        if (["stop", "end"].some(val => instr.includes(val)) &&
            ["recording", "record", "game"].some(val => instr.includes(val))) {
            recording = false;
            return "I am no-longer recording. to start again, you just need to ask 'start recording'";
        }
        if (["opening"].some(val => instr.includes(val))) {
            return questions["positive_answer"][any_element(questions["positive_answer"].length)] +
                response.bot_answer("A5");
        }
        if (["review", "game"].every(val => instr.includes(val))) {
            return board_record[1];
        }
    }
    if (["agim", "hi", "hello", "ola", "hie", "bonjour", " greetings", "hallo"].some(val => instr.includes(val))) {
        return response.bot_answer("A99");
    }
    return "";
}//instructions, mainly for openings and or recording

function bot_response(words) {
    if (words[0] === "") {
        return questions["probe"][any_element(questions["probe"].length)]
    } else if (words[0] === "_") {
        bot_question = (bot_question + 1) % questions["yes_or_no"].length;
        bot_raise = true;
        return questions["yes_or_no"][bot_question - 1]; //see what happens when this rolls over at length and this value becomes -1
    }
    if (bot_raise) {
        if (["yes", "ja", "yup", "da", "yebo"].some(val => words.includes(val))) {
            bot_raise = false;
            return response.bot_answer("A" + bot_question)
        } else if (["no", "nope", "nein", "nada", "na", "ayewa"].some(val => words.includes(val))) {
            bot_raise = false;
            return questions["enquire"][any_element(questions["enquire"].length)]
        }
    } else {
        if (["yes", "ja", "yup", "da", "yebo", "ok", "okay", "sure", "cool", "so"].some(val => words.includes(val))) {
            if (!first_go) {
                return response.next_ans();
            } else {
                first_go = false;
                let t = 'Chess is a strategy board game for two players, called White and Black,' +
                    ' each controlling an army of chess pieces (16) in their color, with the objective to checkmate the' +
                    ' opponent\'s king. '
                return t + bot_response("_");
            }
        } else {
            if (["no", "nope", "nein", "nada", "na", "ayewa"].some(val => words.includes(val))) {
                return bot_response("_");
            }
        }
    }
    return "";
} //Automated responses to automated predefined questions


function any_element(arr_len) {
    return Math.floor(Math.random() * arr_len);
} //Chooses random element in anny array

module.exports = {find_keywords, converstaion_handler: conversation_handler}


// -------------------------------------------------------------testing---------------------------------------
