// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * This method will be called at the start of exports.transform in conceptual.html.primary.js
 */
exports.preTransform = function (model) {
    var splitKey = model._key.split("/")  
    model._allowReview = (splitKey[splitKey.length - 1] !== "index.md") 
    model._model = JSON.stringify(model)
    model._isHomePage = model._key === "index.md"
    return model;
  }
  
  /**
   * This method will be called at the end of exports.transform in conceptual.html.primary.js
   */
  exports.postTransform = function (model) {
    return model;
  }