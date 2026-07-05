async function vote(option){

    await fetch("/vote",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            option
        })

    });

    loadResults();

}

async function loadResults(){

    const res = await fetch("/results");

    const data = await res.json();

    document.getElementById("results").innerHTML=`
        Cats: ${data.cats}<br>
        Dogs: ${data.dogs}
    `;

}

loadResults();