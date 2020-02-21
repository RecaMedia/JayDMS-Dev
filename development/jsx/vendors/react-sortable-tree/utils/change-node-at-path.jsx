export default class ChangeNodeAtPath {

  constructor(dataObject) {
    this.originalTreeData = dataObject;
    this.global_index = -1; // So we can start at 0 at the beginning of loop
    this.current_level = 1; // So we can start at 1 at the beginning of loop
    this.final_level = dataObject.path.length; // The amount of items determines the amount of levels

    // Start search for replacement
    this.newTreeData = this.search(dataObject.treeData, dataObject.path);
  }

  search(treeData, path) {

    // Create new array
    let updatedTreeData = [];

    treeData.map((node, this_level_index) => {
      // Update index
      this.global_index++;

      let next_path_index = path[0]; // Always grab the first index since .shift() is used to remove it when done

      // Check if we hit our destination
      if (next_path_index == this.global_index) {
        // Check if we hit our final destination
        if (this.current_level == this.final_level) {
          // Merge new data
          node = (this.originalTreeData.newNode ? Object.assign({}, node, this.originalTreeData.newNode) : false);
        } else {
          // Check if node has children, which is required to move on
          if (node.children != undefined && node.children != null) {
            // Update level
            this.current_level++;
            // Remove first index to get to the next path
            path.shift();
            // Update node with new children info
            node.children = this.search(node.children, path);
          }
          // Nothing happens if children are not found
        }
      } else {
        if (node.children != undefined && node.children != null) {
          // We need to run through any existing children to make sure we move up the global_index
          node.children = this.search(node.children, path);
        }
      }

      if (node) {
        // Push updated node into new tree
        updatedTreeData.push(node);
      }
    });

    return updatedTreeData;
  }
}