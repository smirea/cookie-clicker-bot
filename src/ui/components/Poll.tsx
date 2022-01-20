import { useEffect, useState } from 'react';

const Poll: React.FC<{ time: number, render: () => any }> = ({ time, render }) => {
    const [content, setContent] = useState<any>(null);
    const [timer, setTimer] = useState<any>();

    useEffect(() => {
        const exec = () => {
            clearTimeout(timer);
            setContent(render());
            setTimer(setTimeout(exec, time));
        }
        exec();
    }, [time, render, timer]);

    return content;
}

export default Poll;
