import { useEffect, useState } from 'react'
import { firebase } from 'src/initFirebase'
import styles from 'src/styles/Home.module.css'
import gameStyles from 'src/styles/Game.module.css'

const db = firebase.database()
const gameBoard = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
];

export default function Game({ id }) {
    const [game, setGame] = useState(null)
    const currentGameRef = db.ref(`/games/${id}`)

    useEffect(() => {
        currentGameRef.on('value', snapShot => {
            const currentGame = snapShot.val()
            setGame(currentGame)
        })
        return () => {
            currentGameRef.off()
        }
    }, [id])

    const isAllColFilled = list => list.filter(col => col == '').length === 0

    const isGameOver = () => {
        const rowsWithEmptyCells = game.gameBoard.filter(row => {
            return !isAllColFilled(row)
        });

        return rowsWithEmptyCells.length === 0
    }

    const checkWinner = () => {
        const isAllItemsInArraySame = list => {
            const prev = {
                [list[0]]: 1
            };

            return list.filter(col => !!prev[col]).length === list.length
        }


        const checkHorizontal = () => {
            for(let i = 0; i < game.gameBoard.length; i++) {
                const list = game.gameBoard[i]

                if(isAllColFilled(list) && isAllItemsInArraySame(list)) return true
            }

            return false
        };
        const checkVertical = () => {
            const verticals = [];
            
            for(let i = 0; i < game.gameBoard.length; i++) {
                const row = game.gameBoard[i]

                row.forEach((col, colIdx) => {
                    if (!verticals?.[colIdx]) {
                        verticals[colIdx] = []
                    }
                    verticals[colIdx].push(col)
                })
            }

            console.log({ verticals })

            for(let i = 0; i < verticals.length; i++) {
                const list = verticals[i]

                if(isAllColFilled(list) && isAllItemsInArraySame(list)) return true
            }

            return false;
        };
        const checkDiagonal = () => {
            const leftDiagonal = []
            const rightDiagonal = []

            for(let i = 0; i < game.gameBoard.length; i++) {
                const row = game.gameBoard[i]
                const leftCol = row[i]
                const reversedRow = [...row]
                reversedRow.reverse()
                const rightCol = reversedRow[i]

                leftDiagonal.push(leftCol)
                rightDiagonal.push(rightCol)
            }

            const diagonals = [leftDiagonal, rightDiagonal]

            console.log({ diagonals })

            for(let i = 0; i < diagonals.length; i++) {
                const list = diagonals[i]

                if(isAllColFilled(list) && isAllItemsInArraySame(list)) return true
            }

            return false;
        };

        const horizontal = checkHorizontal()
        const vertical = checkVertical()
        const diagonal = checkDiagonal()

        if (horizontal) {
            console.log("horizontal!")
        }

        if (vertical) {
            console.log("vertical!")
        }

        if (diagonal) {
            console.log("diagonal!")
        }

        return horizontal || vertical || diagonal
    }

    if (!game) {
        return (
            <div>
                Loading game...
            </div>
        )
    }

    const isWinnerAvailable = checkWinner()

    const renderBoard = () => {
        return game.gameBoard.map((row, rowIdx) => {
            const cols = row.map((col, colIdx) => {
                return (
                    <div
                        role="button"
                        className={`${gameStyles.col} ${isWinnerAvailable ? gameStyles.disabled : ''}`}
                        key={`col-${rowIdx}-${colIdx}`}
                        onClick={() => {
                            if (isWinnerAvailable || game.gameBoard[rowIdx][colIdx] !== '') return;

                            const newBoard = [...game.gameBoard]
                            newBoard[rowIdx][colIdx] = game.currentPlayer === game.player1 ? 'X' : 'O';
                            const nextPlayer = game.currentPlayer === game.player1 ? game.player2 : game.player1;

                            currentGameRef.set({
                                ...game,
                                gameBoard: newBoard,
                                currentPlayer: nextPlayer
                            })
                        }}
                    >
                        {col}
                    </div>
                )
            });

            return (
                <div className={gameStyles.row} key={`row-${rowIdx}`}>
                    {cols}
                </div>
            )
        })
    }

    const gameOver = isGameOver();

    return (
        <div className={styles.container}>
            {!gameOver && !isWinnerAvailable && (
                <h3>
                    {game.currentPlayer}'s chance
                </h3>
            )}

            {isGameOver() && (
                <h4>
                    Game over! No winners! Please clear board and retry
                </h4>
            )}

            {isWinnerAvailable && (
                <h4>
                    {`Winner has been found! ${game.currentPlayer === game.player1 ? game.player2 : game.player1} is the winner`}
                </h4>
            )}

            {renderBoard()}

            <button
                className={gameStyles.resetBoard}
                onClick={() => {
                    currentGameRef.set({
                        ...game,
                        gameBoard
                    })
                }}
            >
                Reset Board
            </button>
        </div>
    )
}

export const getServerSideProps = async ({ query }) => {
    return { props: { id: query.id } };
};