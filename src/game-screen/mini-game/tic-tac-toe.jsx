import React, { useState } from 'react';

function Square({ value, onSquareClick }) {

    return <button className='square' onClick={onSquareClick}>{value}</button>

}

export default function Board() {
    const [squares, setSquares] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);

    function handleClick(i) {
        if (squares[i] || checkWin(squares)) return;

        const nextSquares = squares.slice();

        nextSquares[i] = xIsNext ? 'X' : 'O';
        setSquares(nextSquares);
        setXIsNext(!xIsNext);
    }

    const winner = checkWin(squares);
    let status = '';
    if (winner) {
        status = 'Winner : ' + winner;
    }else {status = 'Next player ' + (xIsNext ? 'X' : 'O')};
    

    return (
        <>  
            <div className="status">{status}</div>
            <div className="board">
                {squares.map((value,index) => (
                    <Square key={index} value={value} onSquareClick={() => handleClick(index)} />
                ))}
            </div>
        </>
    )
}


function checkWin(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a,b,c] = lines[i];

        if(squares[a] && squares[a] === squares[b] && squares[c]) {
            return squares[a];
        }
    }

    return false;
}
