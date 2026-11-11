// Catálogo de produtos em memória. Cada instância serverless tem sua própria
// cópia (reinicia em cold start), então o estado não é consistente entre
// requisições - para o teste de carga isso não importa, o foco é tempo de
// resposta / vazão / erros, não persistência real de dados.
let items = [
  { id: 1, name: "Notebook", price: 2999.9 },
  { id: 2, name: "Mouse", price: 89.9 },
  { id: 3, name: "Teclado Mecânico", price: 349.9 },
  { id: 4, name: "Monitor 27\"", price: 1199.0 },
];
let nextId = 5;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = async (req, res) => {
  // Simula custo de processamento/consulta a banco (50-200ms)
  await delay(50 + Math.random() * 150);

  if (req.method === "GET") {
    res.status(200).json({ items });
    return;
  }

  if (req.method === "POST") {
    const body = req.body || {};
    if (!body.name || typeof body.price !== "number") {
      res.status(400).json({ error: "campos 'name' (string) e 'price' (number) são obrigatórios" });
      return;
    }
    const item = { id: nextId++, name: body.name, price: body.price };
    items.push(item);
    res.status(201).json({ item });
    return;
  }

  res.status(405).json({ error: "método não suportado" });
};
