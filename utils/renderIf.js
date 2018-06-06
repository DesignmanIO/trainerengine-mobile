const multi = () => {
  const cases = [];

  function createEvaluator() {
    return function evaluate() {
      for (let index = 0; index < cases.length; index++) {
        if (cases[index].condition) {
          if (typeof cases[index].elemOrThunk === 'function') {
            return cases[index].elemOrThunk();
          }

          return cases[index].elemOrThunk;
        }
      }

      return null;
    };
  }

  function ifCondition(condition) {
    return (elemOrThunk) => {
      cases.push({ condition, elemOrThunk });
      return ifConditionApi;
    };
  }

  function elseCondition(elemOrThunk) {
    cases.push({ condition: true, elemOrThunk });
    return createEvaluator();
  }

  const ifConditionApi = Object.assign(createEvaluator(), {
    else: elseCondition,
    elseIf: ifCondition,
  });

  return { if: ifCondition };
};

const renderIf = () => {};
renderIf.if = condition => multi().if(condition);

export default renderIf;
