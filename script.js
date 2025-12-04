(() => {
  const outputEl = document.getElementById('output');
  const historyEl = document.getElementById('history');
  const buttons = document.querySelectorAll('.buttons .btn');

  let current = '';   
  let previous = '';  


  function render() {
    outputEl.textContent = current === '' ? '0' : current;
    historyEl.textContent = previous;
  }


  function evaluateExpression(expr) {
    if (!expr || expr.trim() === '') return '';

 
    let safe = expr.replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-');

 
    safe = safe.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    if (!/^[0-9+\-*/().\s]+$/.test(safe)) {
      throw new Error('Invalid characters in expression');
    }

    try {
      const result = Function(`"use strict"; return (${safe})`)();
      if (typeof result === 'number' && Number.isFinite(result)) {

        return Math.round((result + Number.EPSILON) * 1e12) / 1e12;
      } else {
        throw new Error('Math error');
      }
    } catch (err) {
      throw new Error('Invalid expression');
    }
  }


  function clearAll() {
    current = '';
    previous = '';
    render();
  }

  function appendValue(val) {

    if (val === '.') {

      const parts = current.split(/[\+\-\×\÷\*\/]/);
      const last = parts[parts.length - 1];
      if (last.includes('.')) return;
      if (last === '') current += '0'; 
    }
    current += val;
    render();
  }

  function toggleNegate() {

    if (!current) return;
    if (/^\(0-.*\)$/.test(current)) {

      current = current.replace(/^\(0-(.*)\)$/, '$1');
    } else {
      current = `(0-${current})`;
    }
    render();
  }

  function handlePercent() {
  
    if (!current) return;
    current += '%';
    render();
  }

  function evaluate() {
    try {
      const result = evaluateExpression(current);
      previous = current + ' =';
      current = String(result);
      render();
    } catch (err) {
  
      outputEl.textContent = 'Error';
      setTimeout(render, 900);
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return; 
    const key = e.key;

    if (/^[0-9]$/.test(key)) {
      appendValue(key);
      return;
    }

    if (key === '.') { appendValue('.'); return; }
    if (key === 'Enter' || key === '=') { evaluate(); return; }
    if (key === 'Backspace') {
      current = current.slice(0, -1);
      render();
      return;
    }
    if (key === 'Escape') { clearAll(); return; }

    const opMap = {'+': '+', '-': '-', '*': '×', '/': '÷', '%': '%' };
    if (opMap[key]) {
      appendValue(opMap[key]);
      return;
    }

    if (key === '(' || key === ')') { appendValue(key); return; }
  });

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.value;
      const action = btn.dataset.action;

      if (action === 'clear') {
        clearAll();
        return;
      }
      if (action === 'negate') {
        toggleNegate();
        return;
      }
      if (action === 'percent') {
        handlePercent();
        return;
      }
      if (action === 'evaluate') {
        evaluate();
        return;
      }
      if (v) {
        appendValue(v);
        return;
      }
    });
  });

  render();
})();
