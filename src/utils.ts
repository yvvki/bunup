type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function deepObjectMerge<T extends object>(
    target: T,
    ...sources: DeepPartial<T>[]
): T {
    if (!sources.length) {
        return target;
    }

    const result = {...target};

    for (const source of sources) {
        if (!source || typeof source !== 'object') {
            continue;
        }

        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                const targetValue = result[key];
                const sourceValue = source[key];

                if (
                    sourceValue &&
                    typeof sourceValue === 'object' &&
                    !Array.isArray(sourceValue) &&
                    targetValue &&
                    typeof targetValue === 'object' &&
                    !Array.isArray(targetValue)
                ) {
                    result[key] = deepObjectMerge(
                        targetValue as object,
                        sourceValue as DeepPartial<typeof targetValue>,
                    ) as T[typeof key];
                } else if (Array.isArray(sourceValue)) {
                    const targetArray = Array.isArray(targetValue)
                        ? targetValue
                        : [];
                    const mergedArray = [...targetArray];

                    for (const item of sourceValue) {
                        if (
                            !targetArray.some(
                                targetItem =>
                                    JSON.stringify(targetItem) ===
                                    JSON.stringify(item),
                            )
                        ) {
                            mergedArray.push(item);
                        }
                    }

                    result[key] = mergedArray as T[typeof key];
                } else {
                    result[key] = sourceValue as T[typeof key];
                }
            }
        }
    }

    return result;
}
