/**
 * Created by Samuel Gratzl on 15.12.2014.
 */
import d3 = require('d3');
import C = require('./main');
import data = require('./data');

export class DataBrowser {
  private $node: d3.Selection<any>;

  constructor(private parent: Element, private options = {}) {
    this.options = C.mixin({
      layout : 'tree'
    },options);

    this.$node = this.build(parent);
  }

  private build(parent: Element) {
    var $node = d3.select(parent).append('ul').classed('databrowser', true);

    function buildLevel($level) {
      var $childs = $level.selectAll('li').data((d) => d.children);
      var $childs_enter = $childs.enter().append('li');
      $childs_enter.append('span').on('click', function(d) {
        if (d.children.length > 0) {
          var $parent = d3.select(this.parentNode);
          var collapse = !$parent.classed('collapsed');
          $parent
            .classed('collapsed',collapse)
            .select('ul')
            .style('display',collapse?'none':null);
        }
      });
      $childs_enter.append('ul');
      $childs.classed('leaf', (d) => d.data !== null);
      $childs.select('span').text((d) => d.name);
      $childs.each(function(d) {
        if (d.children.length > 0) {
          buildLevel(d3.select(this).select('ul'));
        }
      });
      $childs.exit().remove();
    }
    data.tree().then((root) => {
      $node.datum(root);
      buildLevel($node);
    });

    return $node;
  }
}


export function create(parent, options) {
  return new DataBrowser(parent, options);
}
