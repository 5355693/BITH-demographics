setwd("/Users/johnlloyd/Google Drive/Mansfield Long-term Demographics/Covariate Data/Forest_loss/")
forestLoss <- read.csv("forest_loss_for_graphing.csv")
#library(tidyr)
forestLossLong <- gather(data = forestLoss, key = "period", value = "forestLoss", 4:5)
#library(ggplot2)

tiff(filename = "forestLossFigure.tiff", width = 6, height = 5, units = "in", res = 600)
forestLossLong %>%
  ggplot(., aes(x = year, y = forestLoss, color = period)) + geom_point() + geom_line() + 
  labs(y = expression ("Area of tree cover lost ("~km^2~")"), x = "Year") + 
  scale_color_manual(labels = c("Annual loss", "Cumulative loss"), values = c("#E69F00", "#56B4E9")) + 
  guides(color=guide_legend(title="")) + theme(axis.title.y = element_text(size = 20),
                                               axis.text.y = element_text(size = 16),
                                               axis.title.x = element_text(size = 20),
                                               axis.text.x = element_text(size = 16))
dev.off()