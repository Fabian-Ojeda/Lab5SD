function createInstance(){
    
    axios.post('http://localhost:2000/newInstance').then((result) => {
        alert(result.data);
      })
}

