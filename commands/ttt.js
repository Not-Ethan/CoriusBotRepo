module.exports ={
  name: "ttt",
  description: "Play tic tac toe against the computer or your friends!",
  aliases: ["tictactoe"],
  syntax: "`ttt` <user>",
  enabled: true,
  hidden: true,
  async execute(client, message, args) {
    const ended = false
    const prefix = client.settings.get(message.guild.id).prefix

    let nBoard = [["","",""],["","",""],["","",""]];

    const ints = ["zero", "one", "two", "three", "four", "five","six","seven","eight","nine"];
    function strInt(num) {
      
      if(ints[parseInt(num)]) return ints[num]
    }
    function getMove(board) {
      for(let i = 0; i<board.length; i++) {
        for(let j = 0; j<board[i].legth; j++) {
          
        }
      }
    }
    async function start() {
      const filter = m => m.content.toLowerCase() == "ready" && m.author==message.author
      let agreeCollector = message.channel.createMessageCollector(filter, {time: 10000, limit: 1})
      agreeCollector.on("end", collector=>{
        if(collector.size==0) {
        message.channel.send("No response.")}
      })
     await message.channel.send(`You chose to play tic tac toe! Let me explain how it works: the board will be represented by numbers.\
Type \`${prefix}\`play <number> to play a piece. Type \`ready\` when you are ready.ds mjfhkjsh`)
      agreeCollector.on("collect", collector=>{
          let a = Math.floor(Math.random() * 2)
          var turn;
          if(a==0) {
            message.channel.send("Flipped a coin, you go first.")
            turn = "human"
          }
          if(a==1) {
            message.channel.send("Flipped a coin, I go first.")
            turn = "computer"
          }
        printBoard(nBoard, turn)
      })
    }
    function printBoard(board, turn) {
      //counter for each tile
      var n = 1
      for(let i = 0; i<board.length; i++) {
        for(let j = 0; j<board[i].length; j++) {
          //value of tile
          let square;
          //check if board tile is empty
          if(board[i][j]!="") {
            square = `regional_indicator_${board[i][j]}`
            
          }
          //else assume that square contains a letter
           else {
          square = strInt(parseInt(n))}
          board[i][j]=`:${square}:`
          n++
        }}
        //join each row together with a new line in between
      message.channel.send(`${board[0].join("")}\n${board[1].join("")}\n${board[2].join("")}\n Turn: ${turn}`)
      if(checkWinner(nBoard)){message.channel.send("Winner is: "+checkWinner(nBoard)); ended=true}
    }
    function checkWinner(board) {
      //returns a string representing winner or null if no winner
      //check horizontal win
       for(var i = 0; i<board.length; i++) {
         if(board[i][0]==board[i][1]&&board[i][0]==board[i][2]&&board[i][0]!='') {
           return board[i][0]
         } else
         //check vertical win
           if(board[i][0]==board[i+1][1]&&board[i][0]==board[i+2][2]&&board[i][0]!='') {
             return board[i][0]
           } else
           //check diagonal
             if(board[i][2]==board[i+1][1]&&board[i][2]==board[i+2][0]&&board[i][2]) {
               return board[i][0]
            } else
            //check diagonal
              for(let j = 0; j<board[i].length; j++) {
                if(board[i][j]==board[i+1][j]&&board[i][j]==board[i+2][j]&&board[i][j]!='') {
                  return board[i][j]
                }
              }
              //return null if no winner
        return null
       }
    }
    function getLegalMoves(board) {
      //find enpty tiles and add the cordinates into an array as an object
      let moves = []
      for(let i = 0; i<board.length; i++) {
        for(let j = 0; i<board[i].legth; i++) {
          if(board[i][j] == "") moves.push({row: i, index: j, absolute: getIndex(j, i)})
        }
      }
      return moves
    }
    function awaitMove(board) {
      //check legal moves
      let moves = getLegalMoves(board);
      channel.createMessageCollector(m=>m.author==message.author&&moves.find(e=>e.absolute==parseInt(m)))
    }
    function getIndex(x, y) {
      return (y*3 + (x+1))
    }
    function game(board, turn) {
      while(true) {
        if(ended==true) break
        


      }
    }

    start()
  }
}