import { useCallback, useEffect, useRef, useState } from 'react'
import { Category } from '../models/Category'; // ../ ---> kausta võrra ülespoole
import { Product } from '../models/Product';

// React Hook (Reacti erikood)
// 1. peab importima
// 2. peab algama use eesliidesega
// 3. peab olema funktsionaalne - tõmban ta käima nii, et panen sulud lõppu
// 4. ei tohi olla tingimuslikult loodud (if sees)
// 5. ei tohi olla funktsioonide sees loodud

function MainPage() {
  // Järgmine kord:
  // Leheküljed ---> Pageable (Hibernate)
  // Kategooria alusel filtreerimine (custom päring Repository's - Hibernate)

  // muutuja - HTML   muudab muutujat + HTMLi    sulgude sees - algväärtus
  const [kategooriad, setKategooriad] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [productsByPage, setProductsByPage] = useState(1);
  const [page, setPage] = useState(0);
  const [activeCategory, setActiveCategory] = useState(-1);

  // let page = 0; kui muudaks hiljem koodis: page = 1  , siis ei läheks HTMLi uuendama
  // uef -> onload
  useEffect(() => {
    fetch("http://localhost:8080/categories") // API otspunkt kuhu läheb päring
        .then(res=>res.json()) // kogu tagastus: headers, status code
        .then(json=> setKategooriad(json)) // body: sisu mida tagastab meile back-end
  }, []);

  // default = page on 0
  // default = size on 20

  const showByCategory = useCallback((categoryId: number, currentPage: number) => {
    setActiveCategory(categoryId);
    setPage(currentPage);
    fetch("http://localhost:8080/category-products?categoryId=" + categoryId + 
      "&size=" + productsByPage +
      "&page=" + currentPage // currentPage, sest React update-b useState setterid fnkts-de lõpus
    )
        .then(res=>res.json()) 
        .then(json=> {
          setProducts(json.content);
          setTotalProducts(json.totalElements);
          setTotalPages(json.totalPages);
        }) // mida set'n see muutub HTML-s
  }, [productsByPage])

  useEffect(() => {
    showByCategory(-1, 0);
  }, [showByCategory]);

  // const showByCategory = () => {}

  function updatePage(newPage: number) {
    showByCategory(activeCategory, newPage);
  }

  const productsByPageRef = useRef<HTMLSelectElement>(null); // HTMLi inputiga/selectiga sidumiseks
                                          // .current? ---> küsimärk tähendab, et TypeScript näeb, et Ref on alguses null ehk tühi
                                          //              see tähendab, et tal on 2 väärtuse võimalust
                                          // .current.value ---> selle selecti väärtus, mis väljastab alati Stringi
                                          // Number() ---> konverdime selle .current.value väärtuse numbriks tagasi
  return (
    <div>
      <select ref={productsByPageRef} 
              onChange={() => setProductsByPage(Number(productsByPageRef.current?.value))}>
        <option>1</option>
        <option>2</option>
        <option>3</option>
      </select>
      <button onClick={() => showByCategory(-1, 0)}>Kõik kategooriad</button>
      {kategooriad.map(kategooria => 
      <button key={kategooria.id} onClick={() => showByCategory(kategooria.id, 0)}>
        {kategooria.name}
      </button> )}
      <br />
      <br />
      <div>Kokku tooteid: {totalProducts} tk</div>
      {products.map(product => 
      <div key={product.id}>
        <div>{product.id}</div>
        <div>{product.name}</div>
        <div>{product.price}</div>
        <div>{product.image}</div>
        <div>{product.category?.name}</div>
        {/* <div>{product.active}</div> */}
      </div> )}
      <button disabled={page === 0} onClick={() => updatePage(page - 1)}>Eelmine</button>
      <span>{page + 1}</span>
      <button disabled={page >= totalPages - 1} 
        onClick={() => updatePage(page + 1)}>Järgmine</button>    
    </div>
  )
}

export default MainPage