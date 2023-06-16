// Declarations
const fs = require('fs');
let raw_data = fs.readFileSync('./pieces.json');
let pieces = JSON.parse(raw_data);
let record = "";
let ini = true;
let board = {};

let moves = require("./Pieces.json")

function make_move(move) { //move is eg 'a2', 'a4', 'Black', 'Pawn'
    let d = move[0];
    let step = move[1]
    if (ini) {
        make_board();
        record = "New Game: " + Date() + "\n";
        ini = false;
    }
    if (check_valid(move, board)) {
    }
    if (d === "") {
        board[step[0]] = "";
        board[step[1]] = step[2] + " " + step[3];
        record = record + ". " + step[2] + " " + step[3] + " " + step[0] + " - " + step[1];
    } else {
        if (step[0][0] === "a") {
            board[pieces[step[2]]["King"]["Current_Position"]] = "";
            board["c" + step[0][1]] = step[2] + " King";
            board[pieces[step[2]]["Castle"]["Current_Position"][1]] = "";
            board["d" + step[0][1]] = step[2] + " Castle";
        } else if (step[0][0] === "h") {
            board[pieces[step[2]]["King"]["Current_Position"]] = "";
            board["g" + step[0][1]] = step[2] + " King";
            board[pieces[step[2]]["Castle"]["Current_Position"][1]] = "";
            board["f" + step[0][1]] = step[2] + " Castle";
        }
        record = record + ". " + step[2] + " King O-O " + step[0];
    }
    return [board, record];
}

module.exports = {make_move};

function check_valid(move) {

    return true;
}

function make_board() {
    let i = 1;
    while (i <= 8) {
        board["a" + i] = "";
        board["b" + i] = "";
        board["c" + i] = "";
        board["d" + i] = "";
        board["e" + i] = "";
        board["f" + i] = "";
        board["g" + i] = "";
        board["h" + i] = "";
        i++;
    }
    for (let key1 in pieces.White) {
        for (let key2 in pieces.White[key1].Current_Position) {
            board[pieces.White[key1].Current_Position[key2]] = "White " + key1;
        }
    }
    for (let key1 in pieces.Black) {
        for (let key2 in pieces.White[key1].Current_Position) {
            board[pieces.Black[key1].Current_Position[key2]] = "Black " + key1;
        }
    }
    board["valid"] = true;
    return board;
}

let add_new_rules = function (rule_title, rule) {
    let jsonData = JSON.stringify({rule_title: rule});
    fs.appendFileSync('Rule.txt', jsonData);
}
