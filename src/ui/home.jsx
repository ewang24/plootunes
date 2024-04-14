import { DbUtils } from "../lib/services/db";

function Home() {

    function handleButtonClick(){
        // DbUtils.init();
    }

    return <>
        <button onClick={handleButtonClick}>BUTTON</button>
    </>
}

export default Home;