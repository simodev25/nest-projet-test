const zoneBC = Zone.current.fork({
  name: 'BC',
  properties: {
    data: {
      value: 'initial'
    }
  }
});

function a() {
  console.log(Zone.current.get('data').value); // 'updated'
}

function b() {
  console.log(Zone.current.get('data').value); // 'initial'
  Zone.current.get('data').value = 'updated';
  setTimeout(a, 2000);
}

zoneBC.run(b);
