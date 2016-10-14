function properties(object) {
  var props = [];
  for (p in object) {
    props.push(p);
  }
  return props.sort();
}