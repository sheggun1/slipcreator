/**
 * SlipCreator integration for the existing GTMC Grade System Apps Script.
 * Add this file to the existing Apps Script project. Do not replace code.gs.
 */
function slipCreatorGetParentData(token) {
  requireRole(token, ['admin']);
  const parents = adminGetParentAccounts({}, token);
  return parents.map(function (parent) {
    return {
      email: String(parent.email || ''),
      name: String(parent.name || ''),
      active: parent.active === true,
      wards: (parent.wards || []).map(function (ward) {
        const student = portalFindStudent_(String(ward.className || ''), String(ward.studentId || ''));
        return {
          studentId: String(ward.studentId || ''),
          className: String(ward.className || ''),
          relationship: String(ward.relationship || ''),
          studentName: student ? String(student.name || '') : ''
        };
      })
    };
  });
}
