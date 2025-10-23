import { library } from "@fortawesome/fontawesome-svg-core";
import * as solidIcons from "@fortawesome/free-solid-svg-icons";
import * as brandIcons from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

function getValidIcons(icons: Record<string, any>): IconDefinition[] {
  return Object.values(icons).filter(
    (icon): icon is IconDefinition =>
      typeof icon === "object" && icon.prefix && icon.iconName
  );
}

library.add(...getValidIcons(solidIcons), ...getValidIcons(brandIcons));

export const byPrefixAndName = {
  fas: solidIcons,
  fab: brandIcons,
};
