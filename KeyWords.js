//const readline = require('readline');
const fs = require("fs");
const board = require('./board.js');
const response = require("./Responses.js");
let key_terms = fs.readFileSync("./key_terms.json")
let rule_book = JSON.parse(key_terms);
let Question_data = fs.readFileSync('./Questions.json');
let questions = JSON.parse(Question_data);
let first_go = true;
let expert_mode = false;

// GLOBALS ---------------------------------------------------------------------------------------------------
let board_record = [];

const grammar = ["can", "is", "does", "will", "should", "could", "would", "how", "why", "when", "what", "which", "will",
    "mean"]
const instruction = ["record", "game", "review", "opening", "recording", "start", "old", "stop", "end", "begin",
    "agim", "hi", "hello", "ola", "hie", "bonjour", " greetings", "hallo", "board", "setup", "question", "ask"]
const piece = ["king", "queen", "bishop", "knight", "castle", "pawn"];
const piece_operator = ["move", "capture", "captured", "many", "start", "position", "place", "placed", "worth",
    "value", "direction", "put", "special", "points"];

let bot_question = 0;
let bot_raise = false;
let recording = false;


async function conversation_handler(sentence = "") {
    let words = sentence.toLowerCase().replace(/[!@#$%^&*()+=<>?:"{},./;~]/g, "").split(" ");
    let kw = find_keywords(words);
    // Bot questions and human answers and bot questions.---------------------------------
    let bot = bot_response(words); // (expert_mode)? bot_response(kw["rule_book"].concat(kw["grammar"])):
    if (!(bot === "")) {
        return bot;
    }

    // Bot questions finished -------------------------------------------------------------
    // Human questions
    first_go = false;
    if (recording && bot_is_move(words)) {
        return "move recorded"
    }//Check if it is a move and the move is recorded:------------------
    if (kw["size"] < 1) {
        return questions["not_understanding"][any_element(questions["not_understanding"].length)];
    }// If keywords too few, ask repeat
    bot = bot_instruction(kw["instruction"]);
    // if (expert_mode){
    //     let temp = response.expert(kw["rule_book"].concat(kw["grammar"]), false);
    //     if (temp !== ""){
    //         return temp;
    //     }
    // }
    if (!(bot === "")) {
        return bot;
    }// Check if it is an instruction and act accordingly


    let find = response.answer(kw)
    return find
} //handles all that chats and assigns them accordingly

function find_keywords(words) {
    let keywords = {"piece": [], "piece operator": [], "rule_book": [], "instruction": [], "grammar": [], "size": 0}
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
        }
        if (grammar.includes(word)) {
            keywords["grammar"].push(word);
            //intentionally not increasing size of the count
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
        if (["setup", "board"].some(val => instr.includes(val))) {
            return response.bot_answer("A1")
        }
        if (["ask", "question"].some(val => instr.includes(val))) {
            expert_mode = false;
            return "Okay, you can Ask Yor question"
        }
    }
    if (["agim", "hi", "hello", "ola", "hie", "bonjour", " greetings", "hallo"].some(val => instr.includes(val))) {
        return response.bot_answer("A99");
    }
    return "";
}//instructions, mainly for openings and or recording

function bot_response(words) {
    let yes = ["yes", "ja", "yup", "da", "yebo", "ok", "okay", "sure", "cool", "so"];
    let no = ["no", "nope", "nein", "nada", "na", "ayewa"];

    if (words[0] === "") {
        return questions["probe"][any_element(questions["probe"].length)]
    } else if (words[0] === "_") {
        first_go = false;
        bot_raise = true;
        if (questions["yes_or_no"].length >= bot_question + 1) {
            bot_question = (bot_question + 1);
            return questions["yes_or_no"][bot_question - 1];
        }
        // expert_mode = true;
        return ""
    } else if (words[0] === "luis") {
        first_go = false;
        return "$"
    }
    if (bot_raise) {
        first_go = false;
        bot_raise = false;
        if (yes.some(val => words.includes(val))) {
            return response.bot_answer("A" + bot_question)
        } else if (no.some(val => words.includes(val))) {
            return questions["enquire"][any_element(questions["enquire"].length)] + " " + bot_response("_");
        }
    } else {
        if (yes.some(val => words.includes(val))) {
            if (!first_go) {
                let t = response.next_ans();
                // if (t===""){
                //     expert_mode = true;
                // }
                return t;
            } else {
                first_go = false;
                let t = 'Chess is a strategy board game for two players, called White and Black,' +
                    ' each controlling an army of chess pieces (16) in their color, with the objective to checkmate the' +
                    ' opponent\'s king. '
                return t + bot_response("_");
            }
        } else {
            if (no.some(val => words.includes(val))) {
                return bot_response("_");
            }
        }
    }
    return "";
} //Automated responses to automated predefined questions

function any_element(arr_len) {
    return Math.floor(Math.random() * arr_len);
} //Chooses random element in anny array

function repeater() {
    return questions["repetition"][any_element(questions["repetition"].length)]
} // complain if answer is repeated

function clear() {
    expert_mode = false;
    bot_question = 0;
    board_record = [];
    response.clear();
} // clear everything on disconnect

module.exports = {converstaion_handler: conversation_handler, repeater, clear}


// -------------------------------------------------------------testing---------------------------------------
