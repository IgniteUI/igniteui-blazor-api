exports.transform = function (model) {
  if (model && model.inheritedMembers) {
    model.inheritedMembers.forEach(function (member) {
      if (member.uid) {
        // Strip method parameters (everything from first '(') before finding the class name
        var parenIndex = member.uid.indexOf('(');
        var uidWithoutParams = parenIndex > 0 ? member.uid.substring(0, parenIndex) : member.uid;
        var lastDot = uidWithoutParams.lastIndexOf('.');
        member.inheritedFromClass = lastDot > 0 ? uidWithoutParams.substring(0, lastDot) : uidWithoutParams;
      }
    });
  }
  return model;
};
