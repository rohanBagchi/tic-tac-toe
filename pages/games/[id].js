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

    const checkWinner = () => {
        debugger
        const isAllItemsInArraySame = list => {
            const prev = {};

            return list.some(col => {
                if (Object.keys(prev).length === 0) {
                    prev[col] = 1
                }

                if (!prev[col]) {
                    return false;
                }

                return true
            });
        }

        const isAllColFilled = list => list.filter(col => col === '').length === 0

        const checkHorizontal = () => {
            for(let i = 0; i < game.gameBoard.length; i++) {
                const row = game.gameBoard[i]

                if (!isAllColFilled(row)) return false

                return isAllItemsInArraySame(row);
            }
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

            for(let i = 0; i < verticals.length; i++) {
                const list = verticals[i]

                if (!isAllColFilled(list)) return false

                return isAllItemsInArraySame(list);
            }
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

            for(let i = 0; i < diagonals.length; i++) {
                const list = diagonals[i]

                if (!isAllColFilled(list)) return false

                return isAllItemsInArraySame(list);
            }
        };

        return checkHorizontal() || checkVertical() || checkDiagonal();
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

    return (
        <div className={styles.container}>
            <h3>
                {game.currentPlayer}'s chance
            </h3>

            <h4>
                {isWinnerAvailable && `Winner has been found! ${game.currentPlayer === game.player1 ? game.player2 : game.player1} is the winner`}
            </h4>

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