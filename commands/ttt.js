module.exports ={
  name: "ttt",
  description: "Play tic tac toe against the computer or your friends!",
  aliases: ["tictactoe"],
  syntax: "`ttt` <user>",
  enabled: true,
  hidden: true,
  async execute(client, message, args) {
    const prefix = client.settings.get(message.guild.id).prefix
    let nBoard = [["j","",""],["j","",""],["j","",""]];

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
      var n = 1
      for(let i = 0; i<board.length; i++) {
        for(let j = 0; j<board[i].length; j++) {
          let square;
          if(board[i][j]!="") {
            square = `regional_indicator_${board[i][j]}`
            
          } else {
          square = strInt(parseInt(n))}
          board[i][j]=`:${square}:`
          n++
        }}
      message.channel.send(`${board[0].join("")}\n${board[1].join("")}\n${board[2].join("")}\n Turn: ${turn}`)
      if(checkWinner(nBoard))message.channel.send("Winner is: "+checkWinner(nBoard))
    }
    function checkWinner(board) {
       for(var i = 0; i<board.length; i++) {
         if(board[i][0]==board[i][1]&&board[i][0]==board[i][2]&&board[i][0]!='') {
           return board[i][0]
         } else
           if(board[i][0]==board[i+1][1]&&board[i][0]==board[i+2][2]&&board[i][0]!='') {
             return board[i][0]
           } else
             if(board[i][2]==board[i+1][1]&&board[i][2]==board[i+2][0]&&board[i][2]) {
               return board[i][0]
            } else
              for(let j = 0; j<board[i].length; j++) {
                if(board[i][j]==board[i+1][j]&&board[i][j]==board[i+2][j]&&board[i][j]!='') {
                  return board[i][j]
                }
              }
        return null
       }
    }
    function getLegalMoves(board) {
      for(let i = 0; i<board.length; i++) {
        for(let tile of board[i]) {
            
        }
      }
    }
    start()
  }
}